const { getAccessToken, generateRefreshToken, generateAuthUrl } = require("./oauth");
const axios = require("axios");
const express = require("express");
const router = express.Router();

const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.com/oauth/v2/token";

app.post("/get-token", async (req, res) => {
   try {
      const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
         params: {
            client_id: "1000.95ZSJA7ZYM412J344SUJWU7RU5NKLO",
            client_secret: "d5d338951662ad773c7899bd15e5846786f173cd50",
            code: "1000.813c77d8f81a25cd25e81fa981987a98.dd5fe3542b6f53b52bc0720de0e68fb7",
            grant_type: "authorization_code",
         },
      });

      res.json(response.data);
   } catch (error) {
      console.error("Error fetching token:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: "Failed to fetch token" });
   }
});

router.post("/create-lead", async (req, res) => {
   const zohoAccessToken = process.env.ZOHO_ACCESS_TOKEN; // Store this securely, implement token refresh
   const zohoApiUrl = "https://www.zohoapis.com/crm/v2/Leads";

   try {
      const response = await axios.post(
         zohoApiUrl,
         {
            data: [req.body],
         },
         {
            headers: {
               Authorization: `Zoho-oauthtoken ${zohoAccessToken}`,
               "Content-Type": "application/json",
            },
         },
      );

      res.json(response.data);
   } catch (error) {
      console.error("Error creating lead in Zoho CRM:", error);
      res.status(500).json({ error: "Failed to create lead" });
   }
});

// Route to submit contact form data
router.post("/contact", async (req, res) => {
   const { name, email, phone, message } = req.body;

   try {
      const accessToken = await getAccessToken();

      // API request to add lead/contact in Zoho CRM
      const response = await axios({
         method: "post",
         url: "https://www.zohoapis.com/crm/v2/Leads", // or /Contacts if saving as contacts
         headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
         },
         data: {
            data: [
               {
                  Last_Name: name,
                  Email: email,
                  Phone: phone,
                  Description: message,
               },
            ],
         },
      });

      res.status(200).json({ success: true, message: "Contact added successfully to Zoho CRM" });
   } catch (error) {
      console.error("Error adding contact:", error.response.data);
      res.status(500).json({ success: false, message: "Error adding contact to Zoho CRM" });
   }
});

router.get("/", (req, res) => {
   res.send("Hello World!");
});

// Route to handle refresh token generation
router.get("/get-refresh-token", async (req, res) => {
   try {
      const tokens = await generateRefreshToken();
      res.status(200).json(tokens);
   } catch (error) {
      res.status(500).json({ error: "Failed to generate refresh token" });
   }
});

// Route to redirect the user to Zoho's OAuth authorization page
router.get("/get-auth-code", (req, res) => {
   const authUrl = generateAuthUrl();
   res.redirect(authUrl); // Redirect to Zoho authorization page (Response: Authorization code received: {AUTH_CODE}
});

module.exports = router;
