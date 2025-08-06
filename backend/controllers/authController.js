const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
   const { username, email, password } = req.body;

   try {
       // Check if user already exists
       const existingUser = await User.findOne({ email });
       if (existingUser) {
           return res.status(400).json({ message: "User already exists" });
       }

       // Hash password
       const hashPassword = await bcrypt.hash(password.toString(), 10);

       // Create new user
       const newUser = new User({ username, email, password: hashPassword });
       await newUser.save();

       res.status(201).json({ message: "User has been created successfully!" });
       
   } catch (error) {
       console.error("Signup error:", error);
       return res.status(500).json({ message: "Internal server error" });
   }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Signin request received:", email, password);

    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password.toString(), user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentails"});
        }

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email },
            access_token: token
        });        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const verifyTokens = async (req, res) => {
  try {
    if (req.user) {
        return res.status(200).json({
           success: true,
           message: "Token is valid",
           user: req.user
        })
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { signup, signin, verifyTokens };