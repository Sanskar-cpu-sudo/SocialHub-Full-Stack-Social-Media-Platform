const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const mainRouter = require("./Routes/main.router"); // adjust path if needed
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (only once here)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors()); // allows frontend React app to call backend
app.use(express.json()); // parse JSON bodies

// Routes
app.use("/", mainRouter);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
