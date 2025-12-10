import { createTransport } from "nodemailer";
import config from "../../config";
import path from "path";
import { renderFile } from "ejs";
import ApiError from "../errors/ApiError";

const transporter = createTransport({
  secure: true,
  host: config.smtp.smtp_host,
  port: config.smtp.smtp_port,
  auth: {
    user: config.smtp.smtp_user,
    pass: config.smtp.smtp_pass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName?: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(
      __dirname,
      `./templates/${templateName}.ejs`
    );
    const html = await renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: config.smtp.smtp_from,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log("Email Sendind Error", error.message);
    throw new ApiError(500, "Error sending email");
  }
};
