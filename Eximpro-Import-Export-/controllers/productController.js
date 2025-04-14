import { PrismaClient } from "@prisma/client";  
import { sendLowStockAlert } from "../utils/emailService.js";

const prisma = new PrismaClient();
const Product = prisma.product;

// async function ensureHsCodeExists(hsCode) {
//   const category = await prisma.productCategory.findUnique({
//     where: { hsCode },
//   });

//   if (!category) {
//     await prisma.productCategory.create({
//       data: {
//         hsCode,
//         category: "Default Category", 
//       },
//     });
//   }
// }

// Create a new product
export const createProduct = async (req, res) => {
  const { name, stock, hsCode, unitCost, companyId } = req.body;

  try {
    // Ensure the hsCode exists in the ProductCategory table
    let productCategory = await prisma.productCategory.findUnique({
      where: { hsCode: hsCode },
    });

    // If hsCode does not exist, create a new ProductCategory
    if (!productCategory) {
      productCategory = await prisma.productCategory.create({
        data: {
          hsCode: hsCode,
          category: "default category",  // You can add a default category or modify it based on your needs
        },
      });
      console.log(`Created new ProductCategory with hsCode: ${hsCode}`);
    }

    // Create the product after validating or adding the hsCode
    const product = await prisma.product.create({
      data: {
        name,
        stock,
        hsCode,
        unitCost,
        companyId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: "Failed to create product", details: error.message });
  }
};




// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findUnique({ where: { id: (id) } }); 

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, stock, hsCode, unitCost, category } = req.body;
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
    const product = await Product.update({
      where: { id: id }, 
      data: { name, stock, hsCode, unitCost, category },
    });

    if (product.stock < 10) {
      await sendLowStockAlert(user.email, product.name, product.stock);
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Failed to update product" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await Product.delete({ where: { id: Number(id) } }); 
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete product" });
  }
};
