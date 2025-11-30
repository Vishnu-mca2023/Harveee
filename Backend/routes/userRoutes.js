// const express = require("express");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");
// const multer = require("multer");
// const path = require("path");
// const jwt = require("jsonwebtoken"); // ← ADD THIS

// const router = express.Router();

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 },
// });

// // REGISTER
// router.post("/register", upload.single("profileImage"), async (req, res) => {
//   try {
//     const { name, email, phone, password, address, state, country, city, pincode, role } = req.body;

//     if (!name || !email || !phone || !password || !address || !state || !country || !city || !pincode) {
//       return res.status(400).json({ message: "All fields are required!" });
//     }

//     const existUser = await User.findOne({ email });
//     if (existUser) return res.status(400).json({ message: "Email already exists!" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       address,
//       state,
//       country,
//       city,
//       pincode,
//       role: role || "user",
//       profileImage: req.file ? req.file.path : "",
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required!" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found!" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

//     // JWT Token
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       role: user.role,
//       userId: user._id,
//       token,
//       user: {
//         name: user.name,
//         email: user.email,
//         profileImage: user.profileImage || "",
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/auth/user/:id
// // GET /api/auth/user/:id
// router.get("/user/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("name profileImage");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.status(200).json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// -------------------------------
// Multer setup for profile images
// -------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// -------------------------------
// Admin static credentials
// -------------------------------
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

// -------------------------------
// LOGIN (ADMIN + USER)
// -------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ADMIN LOGIN
    if (email === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD)
        return res.status(400).json({ message: "Invalid admin password" });

      const token = jwt.sign({ userId: "ADMIN001", role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        message: "Admin login successful",
        role: "admin",
        token,
        user: { name: "Admin", email: ADMIN_EMAIL, role: "admin" },
      });
    }

    // USER LOGIN
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "User login successful", role: "user", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------
// REGISTER USER
// -------------------------------
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, phone, password, address, state, city, country, pincode } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists!" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashed,
      address,
      state,
      city,
      country,
      pincode,
      role: "user",
      profileImage: req.file ? `uploads/${req.file.filename}` : "",
    });

    await newUser.save();
    res.json({ success: true, message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------
// GET LOGGED-IN USER PROFILE
// -------------------------------
router.get("/me", authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
