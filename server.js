const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory student database
let students = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav@example.com', grade: 'A', course: 'Computer Science', age: 20, enrolled: '2024-01-15' },
  { id: '2', name: 'Priya Patel', email: 'priya@example.com', grade: 'B+', course: 'Mathematics', age: 22, enrolled: '2024-02-10' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan@example.com', grade: 'A-', course: 'Physics', age: 21, enrolled: '2024-03-05' },
];

let nextId = 4;

// GET all students
app.get('/api/students', (req, res) => {
  const { search, course } = req.query;
  let result = [...students];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  if (course) {
    result = result.filter(s => s.course === course);
  }
  res.json({ success: true, data: result, total: result.length });
});

// GET single student
app.get('/api/students/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: student });
});

// POST create student
app.post('/api/students', (req, res) => {
  const { name, email, grade, course, age } = req.body;
  if (!name || !email || !course) {
    return res.status(400).json({ success: false, message: 'Name, email, and course are required' });
  }
  if (students.find(s => s.email === email)) {
    return res.status(409).json({ success: false, message: 'Email already exists' });
  }
  const student = {
    id: String(nextId++),
    name, email,
    grade: grade || 'N/A',
    course,
    age: parseInt(age) || 18,
    enrolled: new Date().toISOString().split('T')[0]
  };
  students.push(student);
  res.status(201).json({ success: true, data: student, message: 'Student created successfully' });
});

// PUT update student
app.put('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Student not found' });
  students[idx] = { ...students[idx], ...req.body, id: req.params.id };
  res.json({ success: true, data: students[idx], message: 'Student updated successfully' });
});

// DELETE student
app.delete('/api/students/:id', (req, res) => {
  const idx = students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Student not found' });
  students.splice(idx, 1);
  res.json({ success: true, message: 'Student deleted successfully' });
});

// GET stats
app.get('/api/stats', (req, res) => {
  const courses = [...new Set(students.map(s => s.course))];
  const gradeMap = { 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C': 2 };
  const avgGPA = students.length
    ? (students.reduce((acc, s) => acc + (gradeMap[s.grade] || 0), 0) / students.length).toFixed(2)
    : 0;
  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      totalCourses: courses.length,
      averageGPA: avgGPA,
      courses
    }
  });
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));