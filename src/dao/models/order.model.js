import mongoose from "mongoose";
import { paginate } from "mongoose-paginate-v2";

const orderSchema = new mongoose.Schema({
	title: String,
	description: String,
	code: String,
	price: Number,
	status: Boolean,
	stock: Number,
	category: String,
	thumbnails: Object,
});

// Plugin:
//orderSchema.plugin(paginate);

const OrderModel = mongoose.model("orders", orderSchema);

export default OrderModel;