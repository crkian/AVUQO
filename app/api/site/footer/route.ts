import { NextResponse } from "next/server";
import { getPublishedFooter } from "../../../../lib/content/footer.server";

export async function GET() {
  const content = await getPublishedFooter();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store" },
  });
}
