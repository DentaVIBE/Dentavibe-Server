const axios = require("axios");

// Function to get Zoho Access Token
async function getAccessToken() {
   const tokenResponse = await axios.post("https://accounts.zoho.com/oauth/v2/token", null, {
      params: {
         refresh_token: "YOUR_REFRESH_TOKEN",
         client_id: "YOUR_CLIENT_ID",
         client_secret: "YOUR_CLIENT_SECRET",
         grant_type: "refresh_token",
      },
   });

   return tokenResponse.data.access_token;
}

// Function to send form data to Zoho CRM
async function sendDataToZohoCRM(data) {
   const accessToken = await getAccessToken();

   const crmResponse = await axios.post(
      "https://www.zohoapis.com/crm/v2/Leads",
      {
         data: [
            {
               Company: data.company,
               Last_Name: data.lastName,
               First_Name: data.firstName,
               Email: data.email,
               Phone: data.phone,
               Lead_Source: data.source,
            },
         ],
      },
      {
         headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
         },
      },
   );

   return crmResponse.data;
}

module.exports = { sendDataToZohoCRM };
