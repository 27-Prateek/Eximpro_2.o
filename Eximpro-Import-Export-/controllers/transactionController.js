import { PrismaClient } from "@prisma/client";  // ✅ Correct Import
import { sendPaymentReminder } from "../utils/emailService.js";

const prisma = new PrismaClient();
const Transaction = prisma.transaction;

// Create a new transaction
export const createTransaction = async (req, res) => {
  const { companyId, invoiceNumber, amount, status, currency } = req.body;

  // Validate request body
  if (!companyId || !invoiceNumber || !amount || !status || !currency) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch logged-in user's email
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transaction = await prisma.transaction.create({
      data: { companyId, invoiceNumber, amount, status, currency, userId },
    });

    if (status === "Pending") {
      await sendPaymentReminder(user.email, invoiceNumber, amount);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Transaction creation error:", error); // ✅ Log error for debugging
    res.status(400).json({ error: "Failed to create transaction", details: error.message });
  }
};

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findMany({
      include: { company: true }, // ✅ Ensure company relation exists in Prisma schema
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findUnique({
      where: { id: Number(id) }, // ✅ Convert id to number
      include: { company: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { companyId, invoiceNumber, amount, status, currency } = req.body;
  try {
    const transaction = await Transaction.update({
      where: { id: Number(id) }, // ✅ Convert id to number
      data: { companyId, invoiceNumber, amount, status, currency },
    });

    if (status === "Pending") {
      await sendPaymentReminder("admin@example.com", invoiceNumber, amount);
    }

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: "Failed to update transaction" });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    await Transaction.delete({ where: { id: Number(id) } }); // ✅ Convert id to number
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete transaction" });
  }
};
