require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
process.env.TZ = "UTC";

const express = require("express");
const helmet = require('helmet');
const path = require("path");
const app = express();

const userAgent = require("./src/middleware/userAgent");
const customCors = require("./src/middleware/customCors");
const { globalErrHandler, uncaughtErrHandler } = require("./src/middleware/errHandler");
const { appInfo } = require("./src/others/util");

const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(userAgent);
app.use(customCors);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Uncomment if Stripe webhook is needed
// app.use(
//   "/api/webhook",
//   express.raw({ type: "application/json" }),
//   require("./src/controller/subscription")
// );

// Routes
app.use("/api/user", require("./src/controller/user"));
app.use("/api/employee", require("./src/controller/employee"));
app.use("/api/bus", require("./src/controller/bus"));
app.use("/api/scan", require("./src/controller/scan"));

app.get("/api/info", (req, res) => {
  res.status(200).json(appInfo);
});

// Start Server
app.listen(port, (err) => {
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
  console.log(`Server started at port ${port} - ${new Date().toISOString()}`);
});

// Error Handling
uncaughtErrHandler();
app.use(globalErrHandler);