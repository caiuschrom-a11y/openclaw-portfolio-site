interface SuccessSearchParams {
  slug?: string;
  cs_id?: string;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SuccessSearchParams>;
}) {
  const params = await searchParams;
  const slug = params.slug || "your purchase";
  const sessionId = params.cs_id;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div style={{
        display: "inline-block", padding: "6px 14px", background: "#0c1f0c",
        border: "1px solid #1f3a1f", borderRadius: 999, fontSize: 12,
        color: "#84cc84", marginBottom: 24, letterSpacing: 0.5,
      }}>
        PAYMENT CONFIRMED
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
        Thanks for buying {slug}.
      </h1>
      <p style={{ fontSize: 17, color: "#a3a3a3", lineHeight: 1.6, marginBottom: 32 }}>
        Your license key or API key is on its way to your inbox right now. Check
        the email you used at checkout — including the spam folder.
      </p>
      <div style={{
        background: "#0c0c0c", border: "1px solid #262626",
        borderRadius: 8, padding: 24, textAlign: "left", marginBottom: 32,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>What happens next</div>
        <ol style={{ margin: 0, paddingLeft: 20, color: "#d4d4d4", fontSize: 14, lineHeight: 1.8 }}>
          <li>Email arrives within 60 seconds (Stripe webhook → fulfillment).</li>
          <li>For self-hosted tools: clone the GitHub repo, set <code style={{ background: "#171717", padding: "1px 6px", borderRadius: 3 }}>OPENCLAW_LICENSE</code>.</li>
          <li>For SaaS API products: hit our endpoint with <code style={{ background: "#171717", padding: "1px 6px", borderRadius: 3 }}>Authorization: Bearer ock_...</code>.</li>
          <li>If your email doesn&apos;t arrive in 5 minutes, reply to this confirmation and we&apos;ll resend.</li>
        </ol>
      </div>
      {sessionId && (
        <p style={{ fontSize: 12, color: "#737373" }}>
          Order ref: <code>{sessionId}</code>
        </p>
      )}
      <div style={{ marginTop: 40 }}>
        <a href="/" style={{
          color: "#fafafa", textDecoration: "underline", fontSize: 14,
        }}>← Back to all products</a>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Payment confirmed — openclaw",
};
