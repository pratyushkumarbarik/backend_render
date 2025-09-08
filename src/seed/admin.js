const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;
	if (!email || !password) {
		console.warn('Admin seed skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set');
		return;
	}
	const existing = await Admin.findOne({ email });
	if (existing) return;
	const hash = await bcrypt.hash(password, 10);
	await Admin.create({ email, password: hash });
	console.log('Seeded admin user');
}

module.exports = { seedAdmin };
