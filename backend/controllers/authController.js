const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const signup = async (req, res) => {
   const { username, email, password } = req.body;

   try {
       // Check if user already exists
       const existingUser = await User.findOne({ email });
       if (existingUser) {
           return res.status(400).json({ message: "User already exists" });
       }

       // Hash password
       const hashPassword = await bcrypt.hash(password, 10);

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

}
module.exports = { signup, signin };