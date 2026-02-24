import * as Brevo from "@getbrevo/brevo";

if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️  BREVO_API_KEY is not set. Emails will fail.");
}

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM_ADDRESS ?? "kousik.bbtech@gmail.com",
      name: process.env.EMAIL_FROM_NAME ?? "Auth Service",
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("📧 Email sent successfully:", JSON.stringify(result.body));
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};
