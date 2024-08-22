import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: function () {
			return !this.provider;
		}, // last_name requerido solo si no es un registro OAuth
	},
	email: {
		type: String,
		//required: true,
		unique: true,
		index: true,
	},
	age: {
		type: Number,
		required: true,
	},
	password: {
		type: String,
		required: function () {
			return !this.provider;
		}, // password requerido solo si no es un registro OAuth
	},
	cart: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Cart",
	},
	role: {
		type: String,
		enum: ["admin", "usuario"],
		default: "usuario",
	},
	provider: {
		type: String,
	},
});

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
