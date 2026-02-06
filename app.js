const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/marketmee";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["influencer", "business", "admin"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/register.html"));
});

// Register API
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).send("User already exists");
    }

    await User.create({ name, email, password, role });

    return res.send("Registration successful. Go back and login.");
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).send("Registration failed.");
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    if (user.role === "influencer") {
      return res.send("Login successful: Influencer");
    }

    if (user.role === "business") {
      return res.send("Login successful: Business");
    }

    return res.send("Login successful: Admin");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Login failed.");
  }
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MarketMe running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
