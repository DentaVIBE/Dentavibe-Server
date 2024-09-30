const axios = require("axios");
const qs = require("qs");

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

// Get access token using refresh token
const getAccessToken = async () => {
   const data = qs.stringify({
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
   });

   const config = {
      method: "post",
      url: "https://accounts.zoho.com/oauth/v2/token",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: data,
   };

   try {
      const response = await axios(config);
      return response.data.access_token;
   } catch (error) {
      console.error("Error fetching access token:", error.response.data);
      throw error;
   }
};

// Function to generate the refresh token
async function generateRefreshToken() {
   try {
      const response = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
         params: {
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: "authorization_code", // For generating refresh token, grant_type is 'authorization_code'
            redirect_uri: process.env.ZOHO_REDIRECT_URI,
            code: process.env.ZOHO_AUTH_CODE, // The authorization code obtained from Zoho
         },
      });

      console.log("Response:", response.data);  

      const refreshToken = response.data.refresh_token;
      const accessToken = response.data.access_token;

      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      // Return the tokens (you can return only the refresh token if you prefer)
      return {
         refreshToken,
         accessToken,
      };
   } catch (error) {
      console.error("Error generating refresh token:", error.response ? error.response.data : error.message);
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

module.exports = { getAccessToken, generateRefreshToken, generateAuthUrl };
