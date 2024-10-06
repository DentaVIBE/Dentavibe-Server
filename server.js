const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

const routes = require("./routes/route"); // Import the router

app.use(cors());
app.use(express.json());

// Use the router
app.use("/api", routes);

// app.use("/", defaultRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});
