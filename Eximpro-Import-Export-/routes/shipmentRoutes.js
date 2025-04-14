import express from "express";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  createCustoms,
} from "../controllers/shipmentController.js";
import authMiddleware from "../utils/authMiddleware.js";
import { loginCompany } from "../controllers/authController.js";

const router = express.Router();

router.post("/",authMiddleware,createShipment);
router.get("/", authMiddleware, getShipments);
router.get("/:id", authMiddleware, getShipmentById);
router.put("/:id", authMiddleware, updateShipment);
router.delete("/:id", authMiddleware, deleteShipment);
router.post("/customs", authMiddleware, createCustoms);

export default router;