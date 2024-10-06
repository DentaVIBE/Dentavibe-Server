const axios = require("axios");

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ACCOUNTS_URL = "https://accounts.zohocloud.ca/oauth/v2/token";
const ZOHO_CRM_URL = "https://www.zohoapis.ca/crm/v2";

async function getZohoAccessToken() {
   try {
      console.log("Attempting to get Zoho access token...");
      console.log("Using ZOHO_ACCOUNTS_URL:", ZOHO_ACCOUNTS_URL);
      const response = await axios.post(ZOHO_ACCOUNTS_URL, null, {
         params: {
            refresh_token: ZOHO_REFRESH_TOKEN,
            client_id: ZOHO_CLIENT_ID,
            client_secret: ZOHO_CLIENT_SECRET,
            grant_type: "refresh_token",
         },
      });
      console.log("Zoho token response:", response.data);
      return response.data.access_token;
   } catch (error) {
      console.error("Error getting Zoho access token:", error.response ? error.response.data : error.message);
      throw error;
   }
}

async function createZohoLead(leadData) {
   try {
      const accessToken = await getZohoAccessToken();
      console.log("Access token obtained:", accessToken);

      const response = await axios.post(
         `${ZOHO_CRM_URL}/Leads`,
         {
            data: [leadData],
         },
         {
            headers: {
               Authorization: `Zoho-oauthtoken ${accessToken}`,
               "Content-Type": "application/json",
            },
         },
      );
      console.log("Zoho lead creation response:", JSON.stringify(response.data));
      return response.data;
   } catch (error) {
      console.error("Error creating Zoho lead:", error.response ? JSON.stringify(error.response.data) : error.message);
      throw error;
   }
}

// Function to generate Zoho OAuth authorization URL
const generateAuthUrl = () => {
   const zohoAuthUrl = process.env.ZOHO_AUTH_URL;
   const clientId = process.env.ZOHO_CLIENT_ID;
   const redirectUri = process.env.ZOHO_REDIRECT_URI;
   const scope = "ZohoCRM.modules.ALL"; // Specify the required scope
   const responseType = "code";
   const accessType = "offline";

   console.log(
      `Zoho OAuth authorization URL: ${zohoAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&access_type=${accessType}`,
   );

   return `${zohoAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&access_type=${accessType}`;
};

async function generateRefreshToken(authCode) {
   try {
      const response = await axios.post("https://accounts.zohocloud.ca/oauth/v2/token", null, {
         params: {
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: process.env.ZOHO_REDIRECT_URI,
            code: authCode,
         },
      });

      console.log("Response:", response.data);

      const refreshToken = response.data.refresh_token;
      const accessToken = response.data.access_token;

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      return {
         refreshToken,
         accessToken,
      };
   } catch (error) {
      console.error("Error generating refresh token:", error.response ? error.response.data : error.message);
      throw error;
   }
}

module.exports = {
   createZohoLead,
   getZohoAccessToken,
   generateAuthUrl,
   generateRefreshToken,
};
