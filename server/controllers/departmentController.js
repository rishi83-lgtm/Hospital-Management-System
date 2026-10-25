import Department from '../models/Department.js';

export async function listDepartments(req, res) {
  const departments = await Department.find({ status: 'Active' }).sort({ name: 1 });
  return res.json({ departments });
}

export async function createDepartment(req, res) {
  const { name, description } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'A department name is required.' });
  }

  const department = await Department.create({ name: name.trim(), description });
  return res.status(201).json({ department });
}
