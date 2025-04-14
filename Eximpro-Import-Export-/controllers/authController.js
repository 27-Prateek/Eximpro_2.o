import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendWelcomeEmail } from "../utils/emailService.js";

const prisma = new PrismaClient();
const User = prisma.user;
const Company = prisma.company;
const Session = prisma.session;

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, "ThisisaJWTSECRETKEY", { expiresIn: "24h" });
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      data: { email, passwordHash: hashedPassword },
    });

    // Send welcome email after successful registration
    await sendWelcomeEmail(user.id);

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(400).json({ error: "User registration failed" });
  }
};

// Register a new company
export const registerCompany = async (req, res) => {
  const { name, type, email, password, contactDetails } = req.body;
  if (!contactDetails) return res.status(400).json({ error: "Contact details are required" });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const company = await prisma.company.create({
      data: {
        name,
        type,
        email,
        passwordHash: hashedPassword,
        contactDetails, // Ensure this field is included
      },
    });

    // Send welcome email after successful registration
    // await sendWelcomeEmail(company.id);

    res.status(201).json({ message: "Company registered successfully"});
  } catch (error) {
    console.error("Register company error:", error);
    res.status(400).json({ error: "Company registration failed" });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Checking user:", email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Stored hash:", user.passwordHash);
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      console.log("Invalid password");
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log("Generating token...");
    const token = jwt.sign({ userId: user.id,role:user.role },"ThisisaJWTSECRETKEY" , { expiresIn: "24h" });

    console.log("Token generated:", token);
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

    return res.json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login a company
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const company = await Company.findUnique({ where: { email } });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const validPassword = await bcrypt.compare(password, company.passwordHash);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(company.id, "COMPANY");

    // await Session.create({
    //   data: { userId: company.id, token, expiresAt: new Date(Date.now() + 3600 * 1000) },
    // });

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 24 * 3600 * 1000 });
    res.json({ message: "Company logged in successfully", token });
  } catch (error) {
    console.error("Login company error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout a user
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ error: "No token provided" });

    await Session.deleteMany({ where: { token } });

    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
    res.json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout user error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
};

// Logout a company
export const logoutCompany = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ error: "No token provided" });

    await Session.deleteMany({ where: { token } });

    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
    res.json({ message: "Company logged out successfully" });
  } catch (error) {
    console.error("Logout company error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
};
