import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(params: {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  const { to, workspaceName, inviterName, inviteUrl } = params;

  await resend.emails.send({
    from: "Alpha Connect <onboarding@resend.dev>",
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on Alpha Connect`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You've been invited to ${workspaceName}</h2>
        <p>${inviterName} has invited you to join their workspace on Alpha Connect.</p>
        <p>
          <a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
            Accept Invite
          </a>
        </p>
        <p style="color:#666;font-size:13px;">This invite link expires in 7 days.</p>
      </div>
    `,
  });
}