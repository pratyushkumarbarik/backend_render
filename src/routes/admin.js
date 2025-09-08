const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authMiddleware } = require('../middleware/auth');
const { upload, fileUrl } = require('../middleware/upload');
const Admin = require('../models/Admin');
const Item = require('../models/Item');
const ReportedItem = require('../models/ReportedItem');

const router = express.Router();

// POST /admin/login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const admin = await Admin.findOne({ email });
		if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, admin.password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
		res.json({ token });
	} catch (err) {
		res.status(500).json({ message: 'Login failed' });
	}
});

// POST /admin/add-item (protected)
router.post('/add-item', authMiddleware, upload.single('image'), async (req, res) => {
	try {
		const { itemName, description, foundLocation } = req.body;
		const image = req.file ? fileUrl(req, req.file.filename) : undefined;
		const item = await Item.create({ itemName, description, foundLocation, image, status: 'Available' });
		res.status(201).json(item);
	} catch (err) {
		res.status(400).json({ message: 'Failed to add item' });
	}
});

// GET /admin/items (protected)
router.get('/items', authMiddleware, async (req, res) => {
	try {
		const items = await Item.find().sort({ createdAt: -1 });
		res.json(items);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch items' });
	}
});

// PUT /admin/items/:id/claim (protected)
router.put('/items/:id/claim', authMiddleware, upload.single('idCardImage'), async (req, res) => {
	try {
		const { id } = req.params;
		const { studentName, rollNo } = req.body;
		const idCardImage = req.file ? fileUrl(req, req.file.filename) : undefined;
		const item = await Item.findByIdAndUpdate(
			id,
			{ status: 'Claimed', claimedBy: { studentName, rollNo, idCardImage } },
			{ new: true }
		);
		if (!item) return res.status(404).json({ message: 'Item not found' });
		res.json(item);
	} catch (err) {
		res.status(400).json({ message: 'Failed to claim item' });
	}
});

// GET /admin/reported-items (protected)
router.get('/reported-items', authMiddleware, async (req, res) => {
	try {
		const items = await ReportedItem.find().sort({ createdAt: -1 });
		res.json(items);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch reported items' });
	}
});

// POST /admin/approve-reported-item/:id (protected)
router.post('/approve-reported-item/:id', authMiddleware, async (req, res) => {
	try {
		const { id } = req.params;
		const reported = await ReportedItem.findById(id);
		if (!reported) return res.status(404).json({ message: 'Reported item not found' });
		const item = await Item.create({
			itemName: reported.itemName,
			description: reported.description,
			foundLocation: reported.foundLocation || 'Reported by user',
			image: reported.image,
			status: 'Available',
		});
		reported.status = 'Approved';
		await reported.save();
		res.json({ approved: item, reported });
	} catch (err) {
		res.status(400).json({ message: 'Failed to approve reported item' });
	}
});

module.exports = router;
