const express = require('express');
const { upload, fileUrl } = require('../middleware/upload');

const Item = require('../models/Item');
const ReportedItem = require('../models/ReportedItem');

const router = express.Router();

// GET /items
router.get('/items', async (req, res) => {
	try {
		const items = await Item.find().sort({ createdAt: -1 });
		res.json(items);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch items' });
	}
});

// POST /report-item
router.post('/report-item', upload.single('image'), async (req, res) => {
	try {
		const { studentName, branch, rollNo, itemName, description } = req.body;
		const image = req.file ? fileUrl(req, req.file.filename) : undefined;
		const reported = await ReportedItem.create({
			studentName,
			branch,
			rollNo,
			itemName,
			description,
			image,
		});
		res.status(201).json(reported);
	} catch (err) {
		res.status(400).json({ message: 'Failed to submit report' });
	}
});

module.exports = router;
