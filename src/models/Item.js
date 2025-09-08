const mongoose = require('mongoose');

const ClaimedBySchema = new mongoose.Schema({
	studentName: { type: String, required: true },
	rollNo: { type: String, required: true },
	idCardImage: { type: String },
}, { _id: false });

const ItemSchema = new mongoose.Schema({
	itemName: { type: String, required: true },
	description: { type: String, required: true },
	foundLocation: { type: String, required: true },
	image: { type: String },
	status: { type: String, enum: ['Available', 'Claimed'], default: 'Available' },
	claimedBy: { type: ClaimedBySchema, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
