const express = require("express");
const { generateRefreshToken } = require("../services/zoho");
const router = express.Router();

router.get("/auth/zoho/callback", async (req, res) => {
   const { code } = req.query;
   if (!code) {
      return res.status(400).json({ error: "Authorization code is missing" });
   }

   try {
      const { refreshToken, accessToken } = await generateRefreshToken(code);

      // Here, you should securely store the refresh token for future use
      // For example, you might want to save it in a database

      res.json({ message: "Authentication successful", refreshToken, accessToken });
   } catch (error) {
      console.error("Error in Zoho callback:", error);
      res.status(500).json({ error: "Failed to authenticate with Zoho" });
   }
});

module.exports = router;
