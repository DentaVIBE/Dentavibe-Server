const express = require("express");
const nodemailer = require("nodemailer");

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

// Helper function to format array data
function formatArrayData(arr) {
   return Array.isArray(arr) ? arr.map((item) => (typeof item === "object" ? item.label : item)).join(", ") : arr;
}

router.post("/submit-funnel", async (req, res) => {
   try {
      const funnelData = req.body;
      console.log("Funnel data:", JSON.stringify(funnelData));

      const emailBody = `
         New Appointment Request

         Patient Information:
         Name: ${funnelData.patientInfo.firstName} ${funnelData.patientInfo.lastName}
         Contact: ${funnelData.patientInfo.contactNumber}
         Email: ${funnelData.patientInfo.emailId}
         Date of Birth: ${new Date(funnelData.patientInfo.dateOfBirth).toLocaleDateString()}
         Gender: ${funnelData.patientInfo.gender}
         Address: ${funnelData.patientInfo.address}, ${funnelData.patientInfo.city}

         Appointment Details:
         Location: ${funnelData.location}
         Specific Concerns: ${formatArrayData(funnelData.specificConcerns)}
         Goals for Mouth: ${formatArrayData(funnelData.goalsForMouth)}
         Best Time for Visit: ${formatArrayData(funnelData.bestTimeForVisit)}

         Selected Doctor: ${funnelData.selectedDoctor ? funnelData.selectedDoctor.name : "No preference"}
         Selected Location: ${funnelData.selectedLocation ? funnelData.selectedLocation.name : "No preference"}
         Address: ${funnelData.selectedLocation ? funnelData.selectedLocation.address : "N/A"}

         Insurance Information:
         Has Insurance: ${funnelData.hasInsurance}
         ${
            funnelData.hasInsurance === "yes"
               ? `Provider: ${funnelData.insuranceProvider}
         Member ID: ${funnelData.insuranceMemberId}
         Is Primary Member: ${funnelData.isPrimaryMember}`
               : ""
         }

         Uses Social Assistance: ${funnelData.useSocialAssistance}
      `;

      const mailOptions = {
         from: process.env.EMAIL_USER,
         to: process.env.NOTIFICATION_EMAIL,
         subject: "New Appointment Request",
         text: emailBody,
      };

      // Send email
      await transporter.sendMail(mailOptions);

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

router.post("/notify-me", async (req, res) => {
   try {
      const { email } = req.body;

      if (!email) {
         return res.status(400).json({ status: false, error: "Email is required" });
      }

      // Email to the admin
      const adminMailOptions = {
         from: process.env.EMAIL_USER,
         to: process.env.NOTIFICATION_EMAIL,
         subject: "New Notification Request",
         text: `A new user has requested to be notified about joining or updates.

         Email: ${email}

         Please follow up with this potential member.`,
      };

      await transporter.sendMail(adminMailOptions);

      // Confirmation email to the user
      const userMailOptions = {
         from: process.env.EMAIL_USER,
         to: email,
         subject: "Thank You for Your Interest in Dentavibe",
         text: `Dear Potential Member,

         Thank you for your interest in Dentavibe. We have received your notification request and our team will be in touch with you shortly with more information about joining or any updates.

         If you have any immediate questions, please don't hesitate to contact us at smile@dentavibe.com.

         Best regards,
         The Dentavibe Team`,
      };

      await transporter.sendMail(userMailOptions);

      res.json({ status: true, message: "Notification request received successfully" });
   } catch (error) {
      console.error("Error processing notification request:", error);
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
