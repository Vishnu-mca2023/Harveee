const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 1000 },
    image: { type: String, default: "" }, // store image path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", contentSchema);