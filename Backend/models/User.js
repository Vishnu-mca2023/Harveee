// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//     phone: String,
//     password: String,
//     address: String,
//     state: String,
//     city: String,
//     country: String,
//     pincode: String,
//     role: { type: String, default: "user" },
//     profileImage: { type: String, default: "" }
//   },
//   {
//     timestamps: true, // <-- auto adds createdAt & updatedAt
//   }
// );

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    country: { type: String },
    pincode: { type: String },

    profileImage: { type: String },

    // IMPORTANT
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
