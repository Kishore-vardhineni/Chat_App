const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes)


const connect = () => {
   mongoose.connect(process.env.MONGO_URI)
   .then(() => {
      console.log("database connected");
   }).catch(() => {
      console.log("database not connected");
   })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connect();
  console.log(`Server is running on port ${PORT}`);
});
