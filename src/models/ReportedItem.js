const mongoose = require('mongoose');

const ReportedItemSchema = new mongoose.Schema({
	studentName: { type: String, required: true },
	branch: { type: String, required: true },
	rollNo: { type: String, required: true },
	itemName: { type: String, required: true },
	description: { type: String, required: true },
	image: { type: String },
	status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('ReportedItem', ReportedItemSchema);
