const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Content = require("../models/Content");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* -----------------------------
   Multer setup for uploads
------------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/* -----------------------------
   CREATE CONTENT
------------------------------*/
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Title & description are required" });
    }

    const newContent = new Content({
      user: req.user._id,
      title,
      description,
      image: req.file ? `uploads/${req.file.filename}` : "",
    });

    await newContent.save();
    res
      .status(201)
      .json({ success: true, message: "Content created successfully", content: newContent });
  } catch (err) {
    console.error("Create content error:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error. Could not create content.", error: err.message });
  }
});

/* -----------------------------
   READ ALL CONTENT
------------------------------*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    let contents;
    if (req.user.role === "admin") {
      contents = await Content.find().populate("user", "name email");
    } else {
      contents = await Content.find({ user: req.user._id });
    }
    res.status(200).json({ success: true, contents });
  } catch (err) {
    console.error("Fetch content error:", err);
    res.status(500).json({ success: false, message: "Server error. Could not fetch content.", error: err.message });
  }
});

/* -----------------------------
   UPDATE CONTENT
------------------------------*/
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid content ID" });
    }

    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Content not found" });

    if (req.user.role !== "admin" && content.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden. You cannot update this content" });
    }

    content.title = req.body.title || content.title;
    content.description = req.body.description || content.description;
    if (req.file) content.image = `uploads/${req.file.filename}`;

    await content.save();
    res.status(200).json({ success: true, message: "Content updated successfully", content });
  } catch (err) {
    console.error("Update content error:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: "Server error. Could not update content.", error: err.message });
  }
});

/* -----------------------------
   DELETE CONTENT
------------------------------*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid content ID" });
    }

    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Content not found" });

    if (req.user.role !== "admin" && content.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden. You cannot delete this content" });
    }

    await Content.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Content deleted successfully" });
  } catch (err) {
    console.error("Delete content error:", err);
    res.status(500).json({ success: false, message: "Server error. Could not delete content.", error: err.message });
  }
});

module.exports = router;
