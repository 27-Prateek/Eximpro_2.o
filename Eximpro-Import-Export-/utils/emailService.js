import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true, // true for 465, false for other ports
  port: 465, 
  auth: {
    user: "ayushranjan132005@gmail.com",
    pass: "xrxr llnw sayc snjr",
  },
});

/**
 * Send an email notification
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body
 */

/**
 * Send a welcome email to the authenticated user
 * @param {string} userId - User ID to send the email to
 */

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Eximpro Notifications" <ayushranjan132005@gmail.com>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (userId) => {
  
    // Fetch user details from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const to = user.email;
    const subject = "Welcome to Eximpro!";
    const text = "Hello, Welcome to Eximpro! We're excited to have you on board.";
    const html = `<p>Hello, <strong>Welcome to Eximpro!</strong> We're excited to have you on board.</p>`;

    const emailStatus = await sendEmail(to, subject, text, html);
    if (!emailStatus.success) {
      console.error(`Failed to send welcome email to ${to}`);
    }
    return emailStatus;
  }


/**
 * Notify about a delayed shipment
 */
export const sendShipmentDelayNotification = async (recipientEmail, shipmentId, status) => {
  const subject = "Shipment Delay Notification";
  const text = `Your shipment ${shipmentId} is currently delayed. Status: ${status}. We apologize for the inconvenience.`;
  const html = `<p>Your shipment <strong>${shipmentId}</strong> is currently delayed. <br>Status: <strong>${status}</strong>. <br>We apologize for the inconvenience.</p>`;

  const emailStatus = await sendEmail(recipientEmail, subject, text, html);
  if (!emailStatus.success) {
    console.error(`Failed to send shipment delay notification to ${recipientEmail}`);
  }
  return emailStatus;
};

/**
 * Notify about low stock levels
 */
export const sendLowStockAlert = async (recipientEmail, productName, currentStock) => {
  const subject = "Low Stock Alert";
  const text = `Warning: Stock of ${productName} is running low. Current stock: ${currentStock}. Please restock soon.`;
  const html = `<p><strong>Warning:</strong> Stock of <strong>${productName}</strong> is running low. <br>Current stock: <strong>${currentStock}</strong>. <br>Please restock soon.</p>`;

  return await sendEmail(recipientEmail, subject, text, html);
};

/**
 * Notify about a pending payment
 */
export const sendPaymentReminder = async (recipientEmail, invoiceNumber, amount) => {
  const subject = "Payment Reminder";
  const text = `Reminder: Your payment for invoice ${invoiceNumber} is pending. Amount due: ${amount}. Please make the payment at the earliest.`;
  const html = `<p><strong>Reminder:</strong> Your payment for invoice <strong>${invoiceNumber}</strong> is pending. <br>Amount due: <strong>${amount}</strong>. <br>Please make the payment at the earliest.</p>`;

  return await sendEmail(recipientEmail, subject, text, html);
};
