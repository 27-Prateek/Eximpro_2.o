import express from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    registerCompany, 
    loginCompany, 
    logoutCompany 
  } from "../controllers/authController.js";
  
  
const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/logout", logoutUser);


router.post("/company/register", registerCompany);
router.post("/company/login", loginCompany);
router.post("/company/logout", logoutCompany);

export default router;



