import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is not set. Emails will fail.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Ecommerce App <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
};

