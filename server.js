const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

console.log("Client ID:", process.env.ZOHO_CLIENT_ID);
console.log("Client Secret:", process.env.ZOHO_CLIENT_SECRET);
console.log("Auth Code:", process.env.ZOHO_AUTH_CODE);

app.post("/api/get-token", async (req, res) => {
   try {
      const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
         params: {
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            code: process.env.ZOHO_AUTH_CODE,
            grant_type: "authorization_code",
         },
      });
      console.log("Response:", response);
      res.json(response.data);
   } catch (error) {
      console.error("Error fetching token:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Failed to fetch token", details: error.response ? error.response.data : error.message });
   }
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});
