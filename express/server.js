const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
var User = require("../models/user");
const app = express();

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
app.use(
  session({
    secret: "rumpinosecret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  console.log("SERIALIZE");
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log("DESERIALIZE");
  User.findById(id, function (error, user) {
    done(error, user);
  });
});

passport.use(
  new localStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (error, user) {
      if (error) return done(error);
      if (!user) return done(null, false, { message: "Incorrect username." });

      bcrypt.compare(password, user.password, function (error, result) {
        if (error) {
          return done(error);
        }
        if (result === false) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      });
    });
  })
);

const userRoute = require("../routes/userRoute");
const fileRoute = require("../routes/fileRoute");
const companyRoute = require("../routes/companyRoute");

const router = express.Router();

function isLoggedIn(request, response, next) {
  if (request.isAuthenticated()) return next();
  response.redirect("/login");
}

function isLoggedOut(request, response, next) {
  if (!request.isAuthenticated()) return next();
  response.redirect("/");
}

app.use("/user", isLoggedIn, userRoute);
app.use("/file", isLoggedIn, fileRoute);
app.use("/company", isLoggedIn, companyRoute);

app.post("/register", (request, response) => {
  const { username, password, password2 } = request.body;

  response.json({
    username: username,
    password: password,
    password2: password2,
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true",
  })
);

app.get("/register", (request, response) => {
  response.render("./pages/registration");
});

app.get("/login", isLoggedOut, (request, response) => {
  response.render("./pages/login");
});

app.get("/logout", function (request, response) {
  request.logout();
  response.redirect("/");
});

app.get("/", isLoggedIn, (request, response) => {
  response.render("index.ejs"), { title: "Home" };
});

// router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
// router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
