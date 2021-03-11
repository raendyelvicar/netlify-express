const db = require("../models/index");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const moment = require("moment");

exports.create = async (request, response) => {
  const {
    firstname,
    lastname,
    username,
    password,
    birthdate,
    position,
  } = request.body;

  // Validate request
  if (
    !firstname ||
    !lastname ||
    !username ||
    !password ||
    !birthdate ||
    !position
  ) {
    response.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const existedUser = await User.findOne({ username: username });

  if (existedUser) {
    response.status(400).send({ message: "Username has already exist." });
  } else {
    bcrypt.genSalt(10, function (error, salt) {
      if (error) return next(error);
      bcrypt.hash(password, salt, function (error, hash) {
        if (error) return next(error);

        const user = new User({
          firstname: firstname,
          lastname: lastname,
          username: username,
          password: hash,
          birthdate: birthdate,
          position: position,
        });

        user
          .save()
          .then((data) => {
            response.redirect("/user");
          })
          .catch((error) => {
            response.status(500).send({
              message:
                error.message || "Some error occurred while creating the User",
            });
          });
      });
    });
  }
};

exports.findAll = (request, response) => {
  const username = request.query.username;

  var condition = username
    ? { username: { $regex: new RegExp(username), $options: "i" } }
    : {};

  User.find(condition)
    .then((data) => {
      return response.status(200).send(data);
    })
    .catch((error) => {
      response.status(500).send({
        message: error.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findOne = (request, response) => {
  const id = request.params.id;
  User.findById(id)
    .then((data) => {
      if (!data) {
        response.status(404).send({ message: "Not found User with id " + id });
      } else response.send(data);
    })
    .catch((error) => {
      response
        .status(500)
        .send({ message: "Error while retrieving user with id=" + id });
    });
};

exports.update = (request, response) => {
  if (!request.body) {
    return response.status(400).send({
      message: "Data to update can not be empty!",
    });
  }
  const id = request.params.id;
  User.findByIdAndUpdate(id, request.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        response
          .status(404)
          .send({ message: `Cannot update user with id=${id}` });
      } else {
        response.send({ message: "User was updated succesfully." });
      }
    })
    .catch((error) => {
      response
        .status(500)
        .send({ message: "Error while updating user with id=" + id });
    });
};

exports.delete = (request, response) => {
  const id = request.params.id;

  User.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        response.status(404).send({
          message: `Cannot delete user with id=${id}.`,
        });
      } else {
        response.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((error) => {
      response.status(500).send({
        message: "Could not delete user with id=" + id,
      });
    });
};

exports.deleteAll = (request, response) => {
  User.deleteMany({})
    .then((data) => {
      response.send({
        message: `${data.deletedCount} user were deleted successfully!`,
      });
    })
    .catch((error) => {
      response.status(500).send({
        message:
          error.message || "Some error occurred while removing all users.",
      });
    });
};
