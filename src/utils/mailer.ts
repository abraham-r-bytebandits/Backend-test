import { BrevoClient } from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️  BREVO_API_KEY is not set. Emails will fail.");
}

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      to: [{ email: to }],
      sender: {
        email: process.env.EMAIL_FROM_ADDRESS ?? "kousik.bbtech@gmail.com",
        name: process.env.EMAIL_FROM_NAME ?? "Auth Service",
      },
      subject,
      htmlContent: html,
    });
    console.log("📧 Email sent successfully:", JSON.stringify(result));
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};
