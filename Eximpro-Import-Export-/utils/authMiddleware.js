import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  console.log("Token from request:", token);

  try {
    const decoded = jwt.verify(token, "ThisisaJWTSECRETKEY");

    // Attach the decoded user information to the request object
    req.user = { userId: decoded.userId };


    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    res.status(400).json({ error: "Invalid token." });

  }
};

export default authMiddleware;
