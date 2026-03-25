// ─────────────────────────────────────────────────────────────────────────────
// lib/emailSender.ts
//
// Thin abstraction over a transactional email provider.
// Default provider: Resend (https://resend.com) — set RESEND_API_KEY.
//
// To swap providers:
//   1. Set RESEND_API_KEY="" and add the new provider's key to .env.local
//   2. Implement the same interface below for the new provider
//   3. Switch the provider selection block in sendEmail()
//
// In development with no RESEND_API_KEY set, email sending is skipped and
// the link is logged to the console instead so local dev still works.
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  // Plain-text fallback for email clients that don't render HTML
  text?: string;
}

export interface EmailResult {
  success: boolean;
  /** Provider message ID when available — useful for debugging */
  id?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// sendEmail — main export
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromAddress =
    process.env.EMAIL_FROM?.trim() ?? "noreply@surihana.vows";

  // ── Development / demo mode: no key configured ───────────────────────────
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      // Safe to log in dev — never expose links in production logs
      console.log(
        `[emailSender] No RESEND_API_KEY set. Skipping email to ${payload.to}.\n` +
          `Subject: ${payload.subject}`
      );
      return { success: true, id: "dev-skipped" };
    }

    // In production an unconfigured key is a hard error — the magic link
    // must be delivered; returning "success" silently would lock users out.
    return {
      success: false,
      error:
        "RESEND_API_KEY is not configured. Magic link email cannot be sent in production."
    };
  }

  // ── Resend provider ───────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {})
      })
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        error: `Resend API error ${response.status}: ${body.slice(0, 200)}`
      };
    }

    const data = (await response.json()) as { id?: string };
    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email send error"
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// buildCapsuleUnlockEmail — notifies the couple (and optionally the author)
// that one or more time capsules have just unlocked.
// ─────────────────────────────────────────────────────────────────────────────
export function buildCapsuleUnlockEmail({
  to,
  count,
  brideName,
  groomName,
  vaultUrl
}: {
  to: string;
  count: number;
  brideName: string;
  groomName: string;
  vaultUrl: string;
}): EmailPayload {
  const brideFirst = brideName.split(" ")[0];
  const groomFirst = groomName.split(" ")[0];
  const subject =
    count === 1
      ? `A memory from your wedding day is ready to open`
      : `${count} memories from your wedding day are ready to open`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0a1e;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#0f0a1e;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#1a1230;border-radius:24px;overflow:hidden;
                      box-shadow:0 8px 40px rgba(232,163,32,0.12);">

          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 0;text-align:center;">
              <div style="width:48px;height:2px;background:#e8a320;margin:0 auto 20px;"></div>
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;
                        text-transform:uppercase;color:#c4b49a;">
                Surihana Vows · Time Capsule
              </p>
              <h1 style="margin:16px 0 0;font-size:26px;font-weight:400;
                         line-height:1.4;color:#f5ede0;">
                A memory is waiting for you
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 48px;">
              <div style="height:1px;background:rgba(232,163,32,0.2);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 48px;font-size:15px;line-height:1.8;color:#c4b49a;">
              <p style="margin:0 0 20px;">
                Dear ${brideFirst} &amp; ${groomFirst},
              </p>
              <p style="margin:0 0 28px;">
                ${count === 1
                  ? "Someone left you a sealed memory on your wedding day. It was set to open today — and the moment has arrived."
                  : `${count} sealed memories left on your wedding day were set to open today. Each one has been waiting patiently for this moment.`
                }
              </p>
              <p style="margin:0 0 28px;color:#e8a320;font-size:14px;">
                Open your family vault to read ${count === 1 ? "it" : "them"}.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 48px 32px;text-align:center;">
              <a href="${vaultUrl}"
                 style="display:inline-block;background:#e8a320;color:#0f0a1e;
                        text-decoration:none;font-size:12px;letter-spacing:0.3em;
                        text-transform:uppercase;padding:14px 36px;
                        border-radius:9999px;font-weight:600;">
                Open the vault
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:8px 48px 40px;font-size:11px;color:#7a6a58;text-align:center;">
              <div style="height:1px;background:rgba(232,163,32,0.15);margin-bottom:24px;"></div>
              <p style="margin:0;">Surihana Vows · Your family archive lives forever.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    subject,
    "",
    `Dear ${brideFirst} & ${groomFirst},`,
    "",
    count === 1
      ? "A sealed memory from your wedding day is ready to open."
      : `${count} sealed memories from your wedding day are ready to open.`,
    "",
    `Open your family vault: ${vaultUrl}`,
    "",
    "Surihana Vows"
  ].join("\n");

  return { to, subject, html, text };
}

export function buildFamilySignupEmail({
  signupLink,
  recipientEmail,
  expiresInHours = 72,
}: {
  signupLink: string;
  recipientEmail: string;
  expiresInHours?: number;
}): Pick<EmailPayload, "subject" | "html" | "text"> {
  const subject = "Your family access invitation";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8f1e7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f8f1e7;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#fffaf5;border-radius:24px;overflow:hidden;
                      box-shadow:0 8px 40px rgba(73,45,34,0.08);">

          <tr>
            <td style="padding:40px 48px 0;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;
                        text-transform:uppercase;color:#a8947e;">
                Private family access
              </p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:400;
                         line-height:1.3;color:#1c1917;">
                Finish setting up your account
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 48px;">
              <div style="height:1px;background:#e7ddd3;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px;font-size:15px;line-height:1.8;color:#57534e;">
              <p style="margin:0 0 20px;">
                Hello,
              </p>
              <p style="margin:0 0 28px;">
                The couple has invited you into their private family space. Use the button below
                to create your password and activate your access.
              </p>
              <p style="margin:0 0 28px;">
                This invitation stays valid for <strong>${expiresInHours} hours</strong> and should only be used by you.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;text-align:center;">
              <a href="${signupLink}"
                 style="display:inline-block;background:#1c1917;color:#ffffff;
                        text-decoration:none;font-size:12px;letter-spacing:0.3em;
                        text-transform:uppercase;padding:14px 36px;
                        border-radius:9999px;">
                Create my password
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 32px;font-size:12px;color:#a8947e;text-align:center;">
              <p style="margin:0 0 8px;">If the button does not work, copy this link into your browser:</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${signupLink}" style="color:#8a5a44;">${signupLink}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 48px 8px;">
              <div style="height:1px;background:#e7ddd3;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 48px 40px;font-size:11px;color:#a8947e;text-align:center;">
              <p style="margin:0 0 6px;">
                This invitation was sent to ${recipientEmail}.
              </p>
              <p style="margin:0;">
                If you were not expecting this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    subject,
    "",
    "The couple invited you into their private family space.",
    `Create your password within ${expiresInHours} hours:`,
    "",
    signupLink,
    "",
    `This invitation was sent to ${recipientEmail}. If you were not expecting this email, you can ignore it.`,
  ].join("\n");

  return { subject, html, text };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildMagicLinkEmail — generates the HTML + text body for a magic link email
// ─────────────────────────────────────────────────────────────────────────────
export function buildMagicLinkEmail({
  magicLink,
  recipientEmail,
  expiresInMinutes = 20,
  celebrationTitle = "Surihana Vows"
}: {
  magicLink: string;
  recipientEmail: string;
  expiresInMinutes?: number;
  celebrationTitle?: string;
}): Pick<EmailPayload, "subject" | "html" | "text"> {
  const subject = `Your sign-in link for ${celebrationTitle}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8f1e7;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#f8f1e7;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#fffaf5;border-radius:24px;overflow:hidden;
                      box-shadow:0 8px 40px rgba(73,45,34,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 0;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;
                        text-transform:uppercase;color:#a8947e;">
                ${celebrationTitle}
              </p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:400;
                         line-height:1.3;color:#1c1917;">
                Your sign-in link
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 48px;">
              <div style="height:1px;background:#e7ddd3;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 48px;font-size:15px;line-height:1.8;color:#57534e;">
              <p style="margin:0 0 20px;">
                Hello,
              </p>
              <p style="margin:0 0 28px;">
                Click the button below to sign in to the ${celebrationTitle} private family
                portal. This link is valid for <strong>${expiresInMinutes} minutes</strong>
                and can only be used once.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 48px 32px;text-align:center;">
              <a href="${magicLink}"
                 style="display:inline-block;background:#1c1917;color:#ffffff;
                        text-decoration:none;font-size:12px;letter-spacing:0.3em;
                        text-transform:uppercase;padding:14px 36px;
                        border-radius:9999px;">
                Sign in now
              </a>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 48px 32px;font-size:12px;color:#a8947e;text-align:center;">
              <p style="margin:0 0 8px;">If the button doesn't work, copy this link into your browser:</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${magicLink}" style="color:#8a5a44;">${magicLink}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px 8px;">
              <div style="height:1px;background:#e7ddd3;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;font-size:11px;color:#a8947e;text-align:center;">
              <p style="margin:0 0 6px;">
                This email was sent to ${recipientEmail}.
              </p>
              <p style="margin:0;">
                If you did not request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${celebrationTitle} — Your sign-in link`,
    "",
    `Click the link below to sign in. It expires in ${expiresInMinutes} minutes and can only be used once.`,
    "",
    magicLink,
    "",
    `This email was sent to ${recipientEmail}. If you did not request this link, ignore this email.`
  ].join("\n");

  return { subject, html, text };
}
