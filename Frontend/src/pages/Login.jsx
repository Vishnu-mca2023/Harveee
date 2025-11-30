import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      toast.error("❌ Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      toast.success("✅ Login successful!");

      setTimeout(() => {
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "user") navigate("/user-dashboard");
        else toast.error("❌ Invalid user role");
      }, 300);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden bg-[#0a1833]">

      {/* ⭐ Glitter Animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 1.2,
            }}
            animate={{
              y: ["0vh", "100vh"],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: Math.random() * 6 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 🔵 Glowing Moving Balls */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-40 h-40 rounded-full bg-purple-500 opacity-20 blur-2xl"
          initial={{
            x: Math.random() * 600 - 300,
            y: Math.random() * 600 - 300,
          }}
          animate={{
            x: Math.random() * 600 - 300,
            y: Math.random() * 600 - 300,
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}

      <ToastContainer position="top-right" autoClose={3000} />

      <motion.form
        onSubmit={loginUser}
        className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl w-80 sm:w-96 flex flex-col gap-5 shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: -60, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
      >
        {/* 🎬 Smooth Fade-In Heading (Fixed - no typing animation) */}
        <motion.h2
          className="text-3xl font-bold text-center text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Login
        </motion.h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-3 rounded-xl border border-white/30 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white transition"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-xl border border-white/30 bg-white/10 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white transition"
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white/20 text-white py-2 rounded-xl font-semibold mt-2 hover:bg-white/30 transition-all duration-300"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            "Login"
          )}
        </button>

        <p
          className="mt-3 text-center text-white/80 hover:underline cursor-pointer"
          onClick={() => navigate("/register")}
        >
          No account? Register
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
