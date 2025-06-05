// ✅ sendEmail.ts สำหรับ Production ด้วย Resend
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY); // 🔑 ใส่ API Key จาก Resend Dashboard

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Failed to send email via Resend:", error);
      throw error;
    }

    console.log("✅ Email sent via Resend:", data);
  } catch (err) {
    console.error("❌ Unexpected Error sending email:", err);
    throw err;
  }
};
