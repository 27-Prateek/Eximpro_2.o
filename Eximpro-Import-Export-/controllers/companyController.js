import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

export const createCompany = async (req, res) => {
  const { name, type, contactDetails } = req.body;
  try {
    const company = await prisma.company.create({  
      data: { name, type, contactDetails },
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: "Failed to create company" });
  }
};

export const  getCompanies = async (req, res) => {
  
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,   
        type: true,
        email: true,
        contactDetails: true,
      },
    });  
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch company" });
  }
};

export const getOne = async (req, res) => {
  try {
    const { user } = req;
    const id = user?.userId;

    if (!id) {
      return res.status(400).json({ error: "User ID is missing from request" });
    }

    const company = await prisma.Company.findUnique({
      where: { id },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
};


export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, type, contactDetails } = req.body;
  try {
    const company = await prisma.company.update({  
      where: { id },
      data: { name, type, contactDetails },
    });
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: "Failed to update company" });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.company.delete({ where: { id } });  
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete company" });
  }
};
