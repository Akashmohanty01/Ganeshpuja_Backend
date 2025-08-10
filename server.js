import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allowed origins
const allowedOrigins = [
  "https://janajagrutiyuvaparisad-ganeshpuja.vercel.app",
  "http://localhost:5173", // local dev
];

// CORS middleware with dynamic origin check
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like Postman or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Handle OPTIONS preflight requests for all routes
app.options("*", cors());

app.use(express.json());

// ===== MongoDB connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Donation Schema =====
const donationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  purpose: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Donation = mongoose.model("Donation", donationSchema);

// ===== Contact Schema =====
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// ===== Routes =====

// POST donation
app.post("/donate", async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.json({ status: "success", message: "Donation saved successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET all donations
app.get("/donations", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ date: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// POST contact message
app.post("/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.json({ status: "success", message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET all contact messages
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
