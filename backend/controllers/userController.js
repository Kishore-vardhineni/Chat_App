const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.status(200).json({
      sucess: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFindByUserId = async (req, res) => {
  try {
    const findUser = await User.findById(req.params.id, {}, { password: 0 });

    console.log("User found:", findUser);

    res.status(200).json({
      sucess: true,
      count: findUser.length,
      findUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUpdatedByUserId = async (req, res) => {
   const { id } = req.params;

   console.log("Requesting update for user ID:", id);
  if (req.user.id === id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true, runValidators: true, projection: { password: 0 } }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        updatedUser,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(404).json({ message: "User not found" });
  }
};

module.exports = { getAllUsers, getFindByUserId, getUpdatedByUserId };
