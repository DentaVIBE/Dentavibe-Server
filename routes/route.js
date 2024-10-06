const express = require("express");
const nodemailer = require("nodemailer");

const { getZohoAccessToken, createZohoLead } = require("../services/zoho");

const router = express.Router();

// Middleware to log requests
router.use((req, res, next) => {
   console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
   next();
});

// Create a transporter using SMTP with updated configuration
const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
   port: 587,
   secure: false, // Use TLS
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
   },
   tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
      // Force TLSv1.2
      minVersion: "TLSv1.2",
   },
});

// Function to format the email body
function formatEmailBody(funnelData) {
   return `
     New Appointment Request
 
     Patient Information:
     Name: ${funnelData.patientInfo?.firstName || ""} ${funnelData.patientInfo?.lastName || ""}
     Email: ${funnelData.patientInfo?.email || ""}
     Phone: ${funnelData.patientInfo?.phone || ""}
 
     Appointment Details:
     Location: ${funnelData.location || ""}
     Specific Concerns: ${funnelData.specificConcerns?.join(", ") || ""}
     Goals for Mouth: ${funnelData.goalsForMouth?.join(", ") || ""}
     Factors Choosing Dentist: ${funnelData.factorsChoosingDentist?.join(", ") || ""}
     Best Time for Visit: ${funnelData.bestTimeForVisit?.join(", ") || ""}
 
     Additional Information:
     Uses Social Assistance: ${funnelData.useSocialAssistance || ""}
     Has Insurance: ${funnelData.hasInsurance || ""}
     Insurance Provider: ${funnelData.insuranceProvider || ""}
     Insurance Member ID: ${funnelData.insuranceMemberId || ""}
     Is Primary Member: ${funnelData.isPrimaryMember || ""}
     Selected Doctor: ${funnelData.selectedDoctor || ""}
     Selected Location: ${funnelData.selectedLocation || ""}
     No Preference: ${funnelData.isNoPreference || ""}
   `;
}

router.get("/test-zoho-token", async (req, res) => {
   try {
      const accessToken = await getZohoAccessToken();
      res.json({ status: true, accessToken });
   } catch (error) {
      res.status(500).json({ status: false, error: error.message });
   }
});

router.post("/submit-funnel", async (req, res) => {
   try {
      const funnelData = req.body;
      console.log("Funnel data:", JSON.stringify(funnelData));

      // Prepare email options
      const mailOptions = {
         from: process.env.EMAIL_USER,
          to: "smile@dentavibe.com",
         subject: "New Appointment Request",
         text: formatEmailBody(funnelData),
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);

      res.json({ status: true, message: "Appointment request sent successfully" });
   } catch (error) {
      console.error("Error processing funnel submission:", error);
      res.status(500).json({ status: false, error: error.message || "Internal server error" });
   }
});

router.post("/subscribe-newsletter", async (req, res) => {
   try {
      const { email } = req.body;

      if (!email) {
         return res.status(400).json({ status: false, error: "Email is required" });
      }

      // Here you would typically add the email to your newsletter database
      // For this example, we'll just send a confirmation email

      const mailOptions = {
         from: process.env.EMAIL_USER,
         to: email,
         subject: "Welcome to Our Newsletter!",
         text: `Thank you for subscribing to our newsletter. We're excited to keep you updated with our latest news and offers!`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ status: true, message: "Successfully subscribed to the newsletter" });
   } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ status: false, error: error.message || "Internal server error" });
   }
});

// router.post("/submit-funnel", async (req, res) => {
//    try {
//       const funnelData = req.body;
//       console.log("Funnel data:", JSON.stringify(funnelData));

//       const leadData = {
//          Last_Name: funnelData.patientInfo?.lastName || "Unknown",
//          First_Name: funnelData.patientInfo?.firstName || "Unknown",
//          Email: funnelData.patientInfo?.email || "",
//          Phone: funnelData.patientInfo?.phone || "",
//          Description: `
//          Location: ${funnelData.location}
//          Specific Concerns: ${funnelData.specificConcerns.join(", ")}
//          Goals for Mouth: ${funnelData.goalsForMouth.join(", ")}
//          Factors Choosing Dentist: ${funnelData.factorsChoosingDentist.join(", ")}
//          Best Time for Visit: ${funnelData.bestTimeForVisit.join(", ")}
//          Uses Social Assistance: ${funnelData.useSocialAssistance}
//          Has Insurance: ${funnelData.hasInsurance}
//          Insurance Provider: ${funnelData.insuranceProvider}
//          Insurance Member ID: ${funnelData.insuranceMemberId}
//          Is Primary Member: ${funnelData.isPrimaryMember}
//          Selected Doctor: ${funnelData.selectedDoctor}
//          Selected Location: ${funnelData.selectedLocation}
//          No Preference: ${funnelData.isNoPreference}
//        `,
//       };
//       console.log("Lead data:", JSON.stringify(leadData));

//       const zohoResponse = await createZohoLead(leadData);
//       console.log("Zoho response:", JSON.stringify(zohoResponse));
//       res.json({ status: true, zohoResponse });
//    } catch (error) {
//       console.error("Error processing funnel submission:", error);
//       res.status(500).json({ status: false, error: error.message || "Internal server error" });
//    }
// });

module.exports = router;
