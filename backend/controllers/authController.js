const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


let refreshTokens = [];

const signUp = async (req, res) => {
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

    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const url = `${process.env.CLIENT_URL}/api/auth/verify-email/${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: newUser.email,
      subject: "Verify your Email",
      html: `<h2>Eamil Verification</h2>
                 <p>Click the link below to verify your email:</p>
                 <a href="${url}">${url}</a>`,
    });

    res.status(201)
      .json({
        message:
          "Signup successful. Please check your email for verification link.",
      });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signIn = async (req, res) => {
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

        const accessToken = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        const refreshToken = jwt.sign({ id: user.id}, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN })

        refreshTokens.push(refreshToken);

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email },
            access_token: accessToken,
            refresh_token: refreshToken
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

const logOut = async (req, res) => {
  const { token } = req.body;
  try {
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.json({ message: "Logged out successfully" });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}; 

const forgotPassword = async (req, res ) => {
   const { email } = req.body;

   try {
      const user = await User.findOne({ email });
      
      if(!user) {
         return res.status(404).json({ message: "User not found with taht email" })
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 1000 * 60 * 60;

      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;

      await user.save();
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
           user: process.env.SMTP_EMAIL,
           pass: process.env.SMTP_PASS
        }
      })

      const resetLink = `http://localhost:4000/api/auth/reset-password/${resetToken}`;

      await transporter.sendMail({
         from: process.env.SMTP_EMAIL,
         to: user.email,
         subject: 'Password Reset Request',
         html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });

      res.status(200).json({ message: "Password reset link sent to your email" }); 

   } catch (error) {
       return res.status(500).json({ message: "Internal server error" });
   } 

}

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log("New password", token, password);

    try {
       const user = await User.findOne({
           resetToken: token,
           resetTokenExpiry: { $gt: Date.now() }
       })

       if(!user) {
           return res.status(400).json({ message: "Invalid or expired token" });
       }

       const hashedPassword = await bcrypt.hash(password.toString(), 10);

       user.password = hashedPassword;
       user.resetToken = undefined;
       user.resetTokenExpiry = undefined;

       await user.save();

       console.log("Reset password request received:", user);

       res.status(200).json({ message: "Password has been reset successfully" });
       
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

     console.log("Change password request received:", currentPassword, newPassword);
    try {
       const user = await User.findById(req.user.id);

       console.log("User found:", user);
       if(!user) {
           return res.status(404).json({ message: "User not found" });
       }

       const isMatch = await bcrypt.compare(currentPassword.toString(), user.password);

       console.log("Password match:", isMatch);
       if(!isMatch) {
          return res.status(401).json({ message: "Current password is incorrect" });
       }

       const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);
       user.password = hashedPassword;
       await user.save();
       res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
      if(!refreshToken) {
         return res.status(401).json({ message: "Refresh token required"})
      }
 
      if(!refreshTokens.includes(refreshToken)) {
         return res.status(403).json({ message: "Invalid refresh token"});
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
         if(err) return res.status(403).json({ message: "Invalid refresh token"});

        const accessToken = jwt.sign({ id: user.id}, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

         //refreshTokens = refreshTokens.filter(token => token !== refreshToken);
         res.status(200).json({
            message: 'Refresh token',
            access_token: accessToken
         })
      })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

const verifyEmail = async (req, res) => {
  console.log("request", req);
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(400).josn({ message: "Invalid token" });
    }

    console.log("user details", user.isVerified);

    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { signUp, signIn, verifyTokens, logOut, forgotPassword, resetPassword, changePassword, refreshToken, verifyEmail };