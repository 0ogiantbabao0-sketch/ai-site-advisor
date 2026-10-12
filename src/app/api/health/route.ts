export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    { status: "ok", mode: "prompt-generator" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
