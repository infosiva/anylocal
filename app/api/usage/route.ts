import { NextRequest } from "next/server";

// Anonymous usage + error events. Structured JSON line to stdout; no PII, no IP stored.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const event = String(b.event ?? "").slice(0, 40);
    const line: Record<string, unknown> = { level: event === "error" ? "error" : "info", scope: "usage", event, ts: Date.now() };
    if (event === "error") line.msg = String(b.msg ?? "").slice(0, 200);
    console.log(JSON.stringify(line));
  } catch {}
  return new Response(null, { status: 204 });
}
