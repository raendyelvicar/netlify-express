"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const router = express.Router();

const db = require("../models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const userRoute = require("../routes/userRoute");
const fileRoute = require("../routes/fileRoute");
const companyRoute = require("../routes/companyRoute");

app.use("/user", userRoute);
app.use("/file", fileRoute);
app.use("/company", companyRoute);

app.post("/register", (request, response) => {
  const { username, password, password2 } = request.body;

  response.json({
    username: username,
    password: password,
    password2: password2,
  });
});

app.post("/login", (request, response) => {
  const { username, password } = request.body;

  response.json({
    username: username,
    password: password,
  });
});

app.get("/register", (request, response) => {
  response.render("./pages/registration");
});

app.get("/login", (request, response) => {
  response.render("./pages/login");
});

app.get("/logout", function (request, response) {
  request.session.loggedin = false;
  request.session.destroy;
  response.redirect("/login");
});

app.get("/", (request, response) => {
  response.render("index.ejs");
});

// router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
// router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
