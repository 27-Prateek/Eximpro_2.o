import { PrismaClient } from "@prisma/client";
import { sendShipmentDelayNotification } from "../utils/emailService.js";

const prisma = new PrismaClient();
const Shipment = prisma.shipment;
const Customs = prisma.customs;

export const createShipment = async (req, res) => {
  const { productId, quantity, originPort, destinationPort, status, estimatedDelivery, companyId } = req.body;

  if (!productId || !destinationPort || !companyId) {
    return res.status(400).json({ error: "Missing required fields: productId, destinationPort, or companyId" });
  }

  try {
    console.log("User from request:", req.user);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: User ID not found in request" });
    }

    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const shipment = await Shipment.create({
      data: {
        productId,
        quantity,
        originPort,
        destinationPort,
        status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        userId,
        companyId, // ✅ you missed this in your previous version
      },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    if (status === "Delayed") {
      await sendShipmentDelayNotification(user.email, shipment.id, status);
    }

    res.status(201).json(shipment);
  } catch (error) {
    console.error("Create Shipment Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};



export const getshipments = async (req, res) => {
  try {
    const shipments = await Shipment.findMany({
      include: {
        product: true,
        customs: true,
        user: {
          select: {
            id: true,
            email: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      }
    });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};

export const getShipmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const shipment = await Shipment.findUnique({
      where: { id },
      include: { product: true, customs: true },
    });
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
};

export const updateShipment = async (req, res) => {
  const { id } = req.params;
  const { productId, quantity, originPort, destinationPort, status, estimatedDelivery } = req.body;
  try {
    const shipment = await Shipment.update({
      where: { id },
      data: { productId, quantity, originPort, destinationPort, status, estimatedDelivery },
    });
    if (status === "Delayed") {
      await sendShipmentDelayNotification("admin@example.com", shipment.id, status);
    }
    res.json(shipment);
  } catch (error) {
    res.status(400).json({ error: "Failed to update shipment" });
  }
};

export const deleteShipment = async (req, res) => {
  const { id } = req.params;
  try {
    await Shipment.delete({ where: { id } });
    res.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete shipment" });
  }
};

export const createCustoms = async (req, res) => {
  const { shipmentId, dutyPaid, tariffPercent, complianceStatus } = req.body;

  if (!shipmentId || dutyPaid == null || tariffPercent == null || !complianceStatus) {
    return res.status(400).json({ error: "Missing required customs fields" });
  }

  try {
    const shipmentExists = await prisma.shipment.findUnique({
      where: { id: shipmentId }
    });

    if (!shipmentExists) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const customs = await Customs.create({
      data: {
        shipmentId,
        dutyPaid,
        tariffPercent,
        complianceStatus,
      },
    });

    res.status(201).json(customs);
  } catch (error) {
    console.error("Customs Creation Error:", error);
    res.status(400).json({
      error: "Failed to create customs details",
      details: error.message,
    });
  }
};



export const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findMany({ include: { product: true, customs: true } });
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};   

