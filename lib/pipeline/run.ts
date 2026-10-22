import type { SupabaseClient } from "@supabase/supabase-js";

import { getConnector } from "../connectors/registry";
import type {
  NormalizedOffer,
  PipelineConnectorKey,
  PipelineRunSummary,
  RawSourceOffer,
} from "../../types/pipeline";
import { normalizeOffer, slugify } from "./normalize";
import { promotionPotential } from "./promotion";
import { calculateAvuqoScore } from "./score";

const now = () => new Date().toISOString();
const numeric = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

async function event(
  supabase: SupabaseClient<any>,
  runId: string,
  eventType: string,
  message: string,
  data: Record<string, unknown> = {},
  level = "info",
  entityType?: string,
  entityId?: string
) {
  await supabase.from("pipeline_events").insert({
    run_id: runId,
    event_type: eventType,
    level,
    message,
    data,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  });
}

async function getControls(supabase: SupabaseClient<any>) {
  const { data } = await supabase
    .from("system_controls")
    .select("control_key,enabled")
    .in("control_key", ["source_ingestion", "deal_publishing", "global_emergency_stop"]);

  const map = new Map((data ?? []).map((row: any) => [row.control_key, Boolean(row.enabled)]));
  return {
    sourceIngestion: map.get("source_ingestion") ?? true,
    dealPublishing: map.get("deal_publishing") ?? true,
    emergencyStop: map.get("global_emergency_stop") ?? false,
  };
}

async function ensureSource(supabase: SupabaseClient<any>, sourceKey: PipelineConnectorKey) {
  const { data: existing, error } = await supabase
    .from("sources")
    .select("id,name,source_type,status,reliability_score,connector_key,sync_enabled,credential_status")
    .eq("connector_key", sourceKey)
    .maybeSingle();

  if (error) throw error;
  if (existing) return existing;

  if (sourceKey !== "demo") {
    throw new Error(`Source registry row not found for connector ${sourceKey}.`);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("sources")
    .insert({
      name: "AVUQO Demo Feed",
      source_type: "internal_test",
      country_code: "GB",
      status: "active",
      reliability_score: 88,
      connector_key: "demo",
      sync_enabled: true,
      credential_status: "ready",
      health_status: "healthy",
      metadata: { stage: "pipeline-test", synthetic: true },
    })
    .select("id,name,source_type,status,reliability_score,connector_key,sync_enabled,credential_status")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function ensureCategory(supabase: SupabaseClient<any>, slug: string) {
  const { data: existing, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (existing?.id) return existing.id as string;

  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  const { data, error: insertError } = await supabase
    .from("categories")
    .insert({ slug, name, is_active: true })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return data.id as string;
}

async function ensureMerchant(
  supabase: SupabaseClient<any>,
  offer: NormalizedOffer,
  affiliateEligible: boolean
) {
  const { data: existing, error } = await supabase
    .from("merchants")
    .select("id,trust_score,affiliate_eligible")
    .eq("slug", offer.merchantSlug)
    .maybeSingle();
  if (error) throw error;

  if (existing?.id) {
    if (affiliateEligible && !existing.affiliate_eligible) {
      await supabase.from("merchants").update({ affiliate_eligible: true }).eq("id", existing.id);
    }
    return {
      id: existing.id as string,
      trustScore: numeric(existing.trust_score, 70),
      affiliateEligible: affiliateEligible || Boolean(existing.affiliate_eligible),
    };
  }

  const { data, error: insertError } = await supabase
    .from("merchants")
    .insert({
      slug: offer.merchantSlug,
      name: offer.merchantName,
      trust_score: 72,
      status: "active",
      affiliate_eligible: affiliateEligible,
      metadata: {
        external_id: offer.merchantExternalId ?? null,
        created_by: "deal-intelligence-pipeline",
      },
    })
    .select("id,trust_score,affiliate_eligible")
    .single();

  if (insertError) throw insertError;
  return {
    id: data.id as string,
    trustScore: numeric(data.trust_score, 72),
    affiliateEligible: Boolean(data.affiliate_eligible),
  };
}

async function findProductByIdentifier(supabase: SupabaseClient<any>, offer: NormalizedOffer) {
  for (const identifier of offer.identifiers) {
    const { data, error } = await supabase
      .from("product_identifiers")
      .select("product_id")
      .eq("identifier_type", identifier.type)
      .eq("identifier_value", identifier.value)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data?.product_id) return data.product_id as string;
  }
  return null;
}

async function ensureProduct(
  supabase: SupabaseClient<any>,
  sourceId: string,
  offer: NormalizedOffer,
  categoryId: string
) {
  let productId = await findProductByIdentifier(supabase, offer);
  let matchMethod = "identifier";
  let matchConfidence = 99;
  let created = false;

  if (!productId) {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("canonical_key", offer.canonicalKey)
      .maybeSingle();
    if (error) throw error;
    productId = data?.id ?? null;
    matchMethod = "canonical_key";
    matchConfidence = offer.brand && offer.model ? 94 : 82;
  }

  if (!productId) {
    const productSlugBase = slugify(`${offer.brand ?? ""} ${offer.model ?? ""}`.trim() || offer.title);
    const productSlug = `${productSlugBase}-${offer.canonicalKey.slice(0, 16)}`.slice(0, 110);
    const { data, error } = await supabase
      .from("products")
      .insert({
        category_id: categoryId,
        slug: productSlug,
        canonical_key: offer.canonicalKey,
        canonical_title: offer.title,
        brand: offer.brand ?? null,
        model: offer.model ?? null,
        description: offer.description ?? null,
        primary_image_url: offer.imageUrl ?? null,
        status: "active",
        product_type: "product",
        metadata: { auto_created: true, created_by: "deal-intelligence-pipeline" },
      })
      .select("id")
      .single();
    if (error) throw error;
    productId = data.id as string;
    matchMethod = offer.identifiers.length ? "new_identifier_product" : "new_canonical_product";
    matchConfidence = offer.identifiers.length ? 92 : offer.brand && offer.model ? 86 : 76;
    created = true;
  }

  for (const identifier of offer.identifiers) {
    await supabase.from("product_identifiers").upsert(
      {
        product_id: productId,
        identifier_type: identifier.type,
        identifier_value: identifier.value,
      },
      { onConflict: "product_id,identifier_type,identifier_value", ignoreDuplicates: true }
    );
  }

  await supabase.from("product_matches").upsert(
    {
      source_id: sourceId,
      source_offer_id: offer.sourceRecordId,
      product_id: productId,
      match_method: matchMethod,
      confidence: matchConfidence,
      status: matchConfidence >= 85 ? "auto_matched" : "candidate",
      evidence: {
        canonical_key: offer.canonicalKey,
        identifiers: offer.identifiers,
        brand: offer.brand ?? null,
        model: offer.model ?? null,
      },
      updated_at: now(),
    },
    { onConflict: "source_id,source_offer_id" }
  );

  return { productId, matchMethod, matchConfidence, created };
}

async function writeIngestionItem(
  supabase: SupabaseClient<any>,
  runId: string,
  sourceId: string,
  raw: RawSourceOffer,
  normalized: NormalizedOffer | null,
  status: string,
  errorMessage?: string
) {
  await supabase.from("source_ingestion_items").upsert(
    {
      run_id: runId,
      source_id: sourceId,
      source_record_id: raw.sourceRecordId,
      raw_data: raw.raw,
      normalized_data: normalized ?? {},
      status,
      error_message: errorMessage ?? null,
      processed_at: status === "accepted" || status === "rejected" ? now() : null,
    },
    { onConflict: "run_id,source_record_id" }
  );
}

function reasonFor(score: ReturnType<typeof calculateAvuqoScore>) {
  const reference = numeric(score.explanation.referencePrice, 0);
  const current = numeric(score.explanation.currentPrice, 0);
  if (reference > current) {
    const saving = reference - current;
    return `About £${Math.round(saving)} below the strongest observed reference price, with ${score.confidence}% evidence confidence.`;
  }
  return `Market and historical evidence produce an AVUQO Score of ${score.score} with ${score.confidence}% confidence.`;
}

async function processOffer(
  supabase: SupabaseClient<any>,
  runId: string,
  source: any,
  raw: RawSourceOffer,
  dealPublishing: boolean
) {
  const normalized = normalizeOffer(raw);
  await writeIngestionItem(supabase, runId, source.id, raw, normalized, "normalized");

  const categoryId = await ensureCategory(supabase, normalized.categorySlug);
  const merchant = await ensureMerchant(
    supabase,
    normalized,
    source.source_type === "affiliate_network" || source.connector_key === "demo"
  );

  const product = await ensureProduct(supabase, source.id, normalized, categoryId);

  const { data: priorOffer, error: priorOfferError } = await supabase
    .from("offers")
    .select("id")
    .eq("source_id", source.id)
    .eq("source_offer_id", normalized.sourceRecordId)
    .maybeSingle();
  if (priorOfferError) throw priorOfferError;

  let historicalPrices: number[] = [];
  if (priorOffer?.id) {
    const { data: history, error: historyError } = await supabase
      .from("price_history")
      .select("price")
      .eq("offer_id", priorOffer.id)
      .eq("is_valid", true)
      .order("observed_at", { ascending: false })
      .limit(30);
    if (historyError) throw historyError;
    historicalPrices = (history ?? []).map((row: any) => numeric(row.price)).filter((price) => price > 0);
  }

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .upsert(
      {
        product_id: product.productId,
        merchant_id: merchant.id,
        source_id: source.id,
        source_offer_id: normalized.sourceRecordId,
        title: normalized.title,
        price: normalized.price,
        currency: normalized.currency || "GBP",
        previous_price: normalized.previousPrice ?? null,
        rrp: normalized.rrp ?? null,
        delivery_cost: normalized.deliveryCost ?? 0,
        total_price: normalized.totalPrice,
        affiliate_url: normalized.affiliateUrl ?? null,
        source_url: normalized.sourceUrl ?? null,
        stock_status: normalized.normalizedStockStatus,
        stock_quantity: normalized.stockQuantity ?? null,
        condition: "new",
        valid_from: normalized.validFrom ?? null,
        valid_until: normalized.validUntil ?? null,
        match_confidence: product.matchConfidence,
        status: normalized.normalizedStockStatus === "out_of_stock" ? "inactive" : "active",
        last_seen_at: now(),
        raw_data: normalized.raw,
        updated_at: now(),
      },
      { onConflict: "source_id,source_offer_id" }
    )
    .select("id")
    .single();
  if (offerError) throw offerError;

  const { data: competitors, error: competitorError } = await supabase
    .from("offers")
    .select("price,total_price")
    .eq("product_id", product.productId)
    .eq("status", "active")
    .neq("id", offer.id)
    .limit(20);
  if (competitorError) throw competitorError;
  const competitorPrices = (competitors ?? [])
    .map((row: any) => numeric(row.total_price || row.price))
    .filter((price) => price > 0);

  const score = calculateAvuqoScore({
    currentPrice: normalized.price,
    previousPrice: normalized.previousPrice,
    rrp: normalized.rrp,
    deliveryCost: normalized.deliveryCost ?? 0,
    historicalPrices,
    competitorPrices,
    merchantTrust: merchant.trustScore,
    matchConfidence: product.matchConfidence,
    sourceReliability: numeric(source.reliability_score, 75),
    stockStatus: normalized.normalizedStockStatus,
  });

  const { data: dealScore, error: scoreError } = await supabase
    .from("deal_scores")
    .upsert(
      {
        product_id: product.productId,
        offer_id: offer.id,
        score: score.score,
        label: score.label,
        confidence: score.confidence,
        decision: score.decision,
        explanation: score.explanation,
        score_version: "avuqo-score-v0.6",
        calculated_at: now(),
        updated_at: now(),
      },
      { onConflict: "offer_id" }
    )
    .select("id")
    .single();
  if (scoreError) throw scoreError;

  await supabase.from("score_components").delete().eq("deal_score_id", dealScore.id);
  await supabase.from("score_components").insert(
    score.components.map((component) => ({
      deal_score_id: dealScore.id,
      component_name: component.key,
      component_score: component.score,
      weight: component.weight,
      evidence: component.evidence,
    }))
  );

  const { error: historyInsertError } = await supabase.from("price_history").insert({
    product_id: product.productId,
    offer_id: offer.id,
    merchant_id: merchant.id,
    source_id: source.id,
    price: normalized.price,
    delivery_cost: normalized.deliveryCost ?? 0,
    total_price: normalized.totalPrice,
    is_valid: true,
    observed_at: now(),
  });
  if (historyInsertError) throw historyInsertError;

  await supabase.from("availability").insert({
    offer_id: offer.id,
    stock_status: normalized.normalizedStockStatus,
    quantity: normalized.stockQuantity ?? null,
    delivery_summary: normalized.deliveryCost ? `Delivery £${normalized.deliveryCost.toFixed(2)}` : "Free delivery",
    available_from: normalized.validFrom ?? null,
    available_until: normalized.validUntil ?? null,
    observed_at: now(),
    raw_data: { source_record_id: normalized.sourceRecordId },
  });

  const referencePrice = numeric(score.explanation.referencePrice, normalized.previousPrice ?? normalized.rrp ?? normalized.price);
  const shouldPublish =
    dealPublishing &&
    score.score >= 60 &&
    score.confidence >= 55 &&
    normalized.normalizedStockStatus !== "out_of_stock";

  await supabase.from("published_deals").upsert(
    {
      offer_id: offer.id,
      product_id: product.productId,
      title: normalized.title,
      category: normalized.categorySlug,
      merchant: normalized.merchantName,
      current_price: normalized.price,
      typical_price: referencePrice,
      saving_amount: Math.max(0, referencePrice - normalized.price),
      avuqo_score: score.score,
      confidence: score.confidence,
      label: score.label,
      decision: score.decision,
      image_url: normalized.imageUrl ?? null,
      stock_status: normalized.normalizedStockStatus,
      reason: reasonFor(score),
      status: shouldPublish ? "published" : "held",
      published_at: shouldPublish ? now() : null,
      updated_at: now(),
    },
    { onConflict: "offer_id" }
  );

  let promotionCreated = false;
  if (
    score.score >= 75 &&
    score.confidence >= 65 &&
    merchant.affiliateEligible &&
    normalized.normalizedStockStatus !== "out_of_stock"
  ) {
    const potential = promotionPotential({
      score,
      categorySlug: normalized.categorySlug,
      merchantTrust: merchant.trustScore,
      stockStatus: normalized.normalizedStockStatus,
    });

    await supabase.from("promotion_candidates").upsert(
      {
        product_id: product.productId,
        offer_id: offer.id,
        target_channel: potential.targetChannel,
        avuqo_score: score.score,
        avuqo_confidence: score.confidence,
        promotion_score: potential.promotionScore,
        promotion_tier: potential.tier,
        destination_type: "avuqo",
        affiliate_eligible: true,
        compliance_clear: false,
        status: "review",
        title_snapshot: normalized.title,
        merchant_snapshot: normalized.merchantName,
        category_snapshot: normalized.categorySlug,
        rationale: {
          generated_by: "deal-intelligence-pipeline",
          channel_fit: potential.channelFit,
          seasonal_relevance: potential.seasonalRelevance,
          demand_signal: potential.demandSignal,
          commission_influence: 0,
          note: "Compliance remains pending. Promotion economics do not affect AVUQO Score.",
        },
        evaluated_at: now(),
        updated_at: now(),
      },
      { onConflict: "offer_id,target_channel" }
    );
    promotionCreated = true;
  }

  await writeIngestionItem(supabase, runId, source.id, raw, normalized, "accepted");
  await event(
    supabase,
    runId,
    "offer_scored",
    `${normalized.title} scored ${score.score} (${score.label}).`,
    {
      score: score.score,
      confidence: score.confidence,
      decision: score.decision,
      published: shouldPublish,
      promotionCandidate: promotionCreated,
    },
    "info",
    "offer",
    offer.id
  );

  return {
    productCreated: product.created,
    pricePointRecorded: true,
    promotionCreated,
  };
}

export async function runDealIntelligencePipeline(
  supabase: SupabaseClient<any>,
  options: { sourceKey: PipelineConnectorKey; limit?: number }
): Promise<PipelineRunSummary> {
  const connector = getConnector(options.sourceKey);
  const limit = Math.max(1, Math.min(options.limit ?? 25, options.sourceKey === "awin" ? 250 : 50));
  const source = await ensureSource(supabase, options.sourceKey);
  const controls = await getControls(supabase);

  if (controls.emergencyStop) throw new Error("Global emergency stop is enabled.");
  if (!controls.sourceIngestion) throw new Error("Source ingestion is disabled in AVUQO system controls.");
  if (!connector.configured()) throw new Error(`${connector.displayName} is not configured.`);
  if (options.sourceKey !== "demo" && (source.status !== "active" || !source.sync_enabled)) {
    throw new Error(`${source.name} is not active. Resume the source in Control Centre before ingestion.`);
  }

  const { data: run, error: runError } = await supabase
    .from("source_sync_runs")
    .insert({
      source_id: source.id,
      status: "running",
      metrics: { connector: options.sourceKey, requested_limit: limit, pipeline_version: "v0.6" },
    })
    .select("id")
    .single();
  if (runError) throw runError;

  const summary: PipelineRunSummary = {
    runId: run.id,
    sourceKey: options.sourceKey,
    seen: 0,
    accepted: 0,
    rejected: 0,
    productsCreated: 0,
    offersUpserted: 0,
    pricePointsRecorded: 0,
    scoresCalculated: 0,
    promotionCandidates: 0,
    status: "completed",
  };

  try {
    await event(supabase, run.id, "run_started", `${connector.displayName} pipeline run started.`, { limit });
    const rows = await connector.fetchOffers({ limit });
    summary.seen = rows.length;

    for (const raw of rows) {
      try {
        const result = await processOffer(supabase, run.id, source, raw, controls.dealPublishing);
        summary.accepted += 1;
        summary.productsCreated += result.productCreated ? 1 : 0;
        summary.offersUpserted += 1;
        summary.pricePointsRecorded += result.pricePointRecorded ? 1 : 0;
        summary.scoresCalculated += 1;
        summary.promotionCandidates += result.promotionCreated ? 1 : 0;
      } catch (error) {
        summary.rejected += 1;
        const message = error instanceof Error ? error.message : "Unknown offer-processing error";
        await writeIngestionItem(supabase, run.id, source.id, raw, null, "rejected", message);
        await event(
          supabase,
          run.id,
          "offer_rejected",
          `${raw.title}: ${message}`,
          { source_record_id: raw.sourceRecordId },
          "warning"
        );
      }
    }

    const metrics = {
      connector: options.sourceKey,
      products_created: summary.productsCreated,
      offers_upserted: summary.offersUpserted,
      price_points_recorded: summary.pricePointsRecorded,
      scores_calculated: summary.scoresCalculated,
      promotion_candidates: summary.promotionCandidates,
    };

    await supabase
      .from("source_sync_runs")
      .update({
        status: "completed",
        records_seen: summary.seen,
        records_accepted: summary.accepted,
        records_rejected: summary.rejected,
        finished_at: now(),
        metrics,
      })
      .eq("id", run.id);

    await supabase
      .from("sources")
      .update({
        last_sync_at: now(),
        last_successful_sync_at: now(),
        health_status: summary.rejected ? "degraded" : "healthy",
        credential_status: connector.configured() ? "ready" : source.credential_status,
        updated_at: now(),
      })
      .eq("id", source.id);

    await supabase.from("system_health").upsert({
      component: `pipeline-${options.sourceKey}`,
      status: summary.rejected ? "degraded" : "healthy",
      last_checked_at: now(),
      last_success_at: now(),
      message: `${summary.accepted}/${summary.seen} source records accepted.`,
      metrics,
    });

    await event(supabase, run.id, "run_completed", `${summary.accepted}/${summary.seen} offers processed.`, metrics);

    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline failure";
    summary.status = "failed";
    summary.error = message;

    await supabase
      .from("source_sync_runs")
      .update({
        status: "failed",
        records_seen: summary.seen,
        records_accepted: summary.accepted,
        records_rejected: summary.rejected,
        finished_at: now(),
        error_summary: message,
        metrics: { connector: options.sourceKey },
      })
      .eq("id", run.id);

    await supabase
      .from("sources")
      .update({ last_sync_at: now(), health_status: "error", updated_at: now() })
      .eq("id", source.id);

    await supabase.from("exceptions").insert({
      exception_type: "source_pipeline_failure",
      severity: "high",
      entity_type: "source",
      entity_id: source.id,
      status: "open",
      reason: message,
      data: { run_id: run.id, connector: options.sourceKey },
    });

    await supabase.from("system_health").upsert({
      component: `pipeline-${options.sourceKey}`,
      status: "error",
      last_checked_at: now(),
      message,
      metrics: { run_id: run.id },
    });

    await event(supabase, run.id, "run_failed", message, {}, "error");
    return summary;
  }
}
