import express from "express";
import {
  // createCompany
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getOne,
} from "../controllers/companyController.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

// router.post("/", createCompany);
router.get("/",getCompanies);
router.get("/getOne",authMiddleware,getOne);
router.get("/:id", authMiddleware ,getCompanyById);
router.put("/:id", authMiddleware, updateCompany);
router.delete("/:id", authMiddleware, deleteCompany);

export default router;