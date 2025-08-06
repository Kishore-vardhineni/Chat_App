const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  console.log("Auth Header:", authHeader);

   if(!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied, no token provided" });
   }

   const token = authHeader.split(" ")[1];

   console.log("Token:", token);

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log("Decoded Token:", decoded);

      req.user = decoded;
      next();
   } catch (error) {
       return res.status(403).json({ message: "Invalid or expired token" });
   }
}

module.exports = verifyToken;