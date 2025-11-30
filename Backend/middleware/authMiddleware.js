const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ADMIN_EMAIL = "admin@gmail.com"; // For admin bypass

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
      // Verify access token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Admin bypass (no DB check)
      if (decoded.userId === "ADMIN001") {
        req.user = { name: "Admin", email: ADMIN_EMAIL, role: "admin" };
        return next();
      }

      // Normal user
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user;
      return next();
    } catch (err) {
      // Token expired → check refresh token
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "Session expired" });

        try {
          const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

          // Admin bypass
          if (decodedRefresh.userId === "ADMIN001") {
            req.user = { name: "Admin", email: ADMIN_EMAIL, role: "admin" };
            const newToken = jwt.sign({ userId: "ADMIN001", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "15m" });
            res.setHeader("x-access-token", newToken);
            return next();
          }

          const user = await User.findById(decodedRefresh.userId).select("-password");
          if (!user) return res.status(404).json({ message: "User not found" });

          // Issue new access token
          const newToken = jwt.sign({ userId: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "15m" });
          res.setHeader("x-access-token", newToken);

          req.user = user;
          return next();
        } catch {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = authMiddleware;
