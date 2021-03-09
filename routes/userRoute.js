const express = require("express");
const router = express.Router();
const User = require("../models/user");
const users = require("../controllers/user.controller");

router.get("/", (request, response) => {
  const user = User.find();
  response.render("pages/add__user", { users: user });
});

// Post new user
router.post("/add", users.create);

// Get all user
router.get("/all", users.findAll);

// Get specific user
router.get("/:id", users.findOne);

// Update user
router.put("/update/:id", users.update);

// Delete user
router.delete("/delete/:id", users.delete);

module.exports = router;
