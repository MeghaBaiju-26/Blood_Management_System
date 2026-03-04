const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Existing Routes
const donorRoutes = require("./routes/donorRoutes");
app.use("/donors", donorRoutes);

const donationRoutes = require("./routes/donationRoutes");
app.use("/donations", donationRoutes);

const healthCheckRoutes = require("./routes/healthCheckRoutes");
app.use("/health-checks", healthCheckRoutes);

const bloodBankRoutes = require("./routes/bloodBankRoutes");
app.use("/blood-bank", bloodBankRoutes);

// ✅ NEW: Blood Request Routes
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");
app.use("/blood-requests", bloodRequestRoutes);

app.get("/", (req, res) => {
  res.send("HEMA Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});