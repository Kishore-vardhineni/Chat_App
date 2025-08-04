const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
   try {
       const users = await User.find({}, { password: 0});

       res.status(200).json({
          sucess: true,
          count: users.length,
          users
       })
   } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
   }
}

const getFindByUserId = async (req, res) => {
    try {
        const findUser = await User.findById(req.params.id);

        console.log("User found:", findUser);

        res.status(200).json({
            sucess: true,
            count: findUser.length,
            findUser
        })
    } catch (error) {
       return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { getAllUsers, getFindByUserId };