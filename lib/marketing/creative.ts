/** Owner-initiated, spending-controlled creative adapters. No background AI calls. */
export const MAX_DAILY_AI_CALLS = 3;
export function marketingAiAllowed() {
  return process.env.MARKETING_AI_GENERATION === "YES" && !!process.env.OPENAI_API_KEY &&
    !!process.env.MARKETING_TEXT_MODEL && !!process.env.MARKETING_IMAGE_MODEL;
}
export function marketingPrompt(input:{
  brand:string;audience:string;tone:string;fact:string;platform:"facebook"|"instagram"|"website"
}) {
  const instructions = [
    "You are a cautious marketing copywriter. Return one draft, not multiple.",
    "Use ONLY the supplied owner-approved fact as a factual source. Do not invent additional benefits, results, prices, availability, promotions or guarantees.",
    "No live football games, deadlines or results; no Rival references. No fabricated testimonials. No false urgency.",
    "Write original helpful content with concise accessible language. The owner must review it.",
    "For website platform, write a useful short structured explanation, not keyword spam.",
    "For social platforms, write a concise accessible caption and a gentle call-to-action."
  ].join(" ");
  const inputText = JSON.stringify(input);
  return {instructions,input:inputText};
}
export async function generateMarketingCaption(input:Parameters<typeof marketingPrompt>[0]) {
  if (!marketingAiAllowed()) throw new Error("Marketing AI generation is not enabled");
  const response = await fetch("https://api.openai.com/v1/responses",{
    method:"POST",headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({model:process.env.MARKETING_TEXT_MODEL,
      ...marketingPrompt(input),max_output_tokens:500,store:false}),
    signal:AbortSignal.timeout(30000),cache:"no-store"
  });
  if (!response.ok) throw new Error("OpenAI text generation failed ("+response.status+")");
  const result: {
    output_text?:string;
    output?:{type:string;content?:{type:string;text?:string}[]}[];
    usage?:{input_tokens?:number;output_tokens?:number}
  } = await response.json();
  const text = (result.output_text||result.output?.flatMap(item=>item.content??[])
    .filter(item=>item.type==="output_text").map(item=>item.text??"").join("")||"").trim();
  if (!text) throw new Error("OpenAI generated no usable text");
  return {text,usage:result.usage??{}};
}
export async function generateMarketingImage(input:{
  brand:string;headline:string;visualStyle:string
}) {
  if (!marketingAiAllowed()) throw new Error("Marketing AI generation is not enabled");
  const prompt = [
    "Create one premium, original, accessible social marketing image.",
    "Brand: "+input.brand+". Design voice: "+input.visualStyle+".",
    "Subject: "+input.headline+". Avoid logos, trademarked imagery, identifiable people, screenshots, text overlays, UI or claims that are not provided.",
    "No photos of real football players and no simulated results, scores, offer pricing or deadlines.",
    "Leave a generous clean area for an optional separately verified caption. No misleading endorsements."
  ].join(" ");
  const response = await fetch("https://api.openai.com/v1/images/generations",{
    method:"POST",headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({model:process.env.MARKETING_IMAGE_MODEL,
      prompt,size:"1024x1024",n:1}),
    signal:AbortSignal.timeout(90000),cache:"no-store"
  });
  if (!response.ok) throw new Error("OpenAI image generation failed ("+response.status+")");
  const result:{data?:{b64_json?:string}[]}=await response.json();
  const image=result.data?.[0]?.b64_json;
  if (!image) throw new Error("OpenAI returned no image data");
  return Buffer.from(image,"base64");
}
