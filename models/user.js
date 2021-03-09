const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	firstname: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	birthdate: {
		type: Date,
		required: true,
		default: Date.now,
	},
	position: {
		type: String,
		required: true,
	},
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
