const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load users
const usersFile = path.join(__dirname, "data/users.json");

function getUsers() {
  return JSON.parse(fs.readFileSync(usersFile));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

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
app.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;
  const users = getUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.send("User already exists");
  }

  users.push({ name, email, password, role });
  saveUsers(users);

  res.send("Registration successful. Go back and login.");
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.send("Invalid credentials");
  }

  if (user.role === "influencer") {
    res.send("Login successful: Influencer");
  } else if (user.role === "business") {
    res.send("Login successful: Business");
  } else {
    res.send("Login successful: Admin");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MarketMe running at http://localhost:${PORT}`);
});
