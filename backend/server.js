const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EducationalPortal';
const DB_NAME = process.env.DB_NAME || 'EducationalPortal';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'Students';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Client & Database variables
let client;
let db;
let studentsCollection;

// Connect to MongoDB using the official MongoDB Node.js Driver
async function connectToDatabase() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    studentsCollection = db.collection(COLLECTION_NAME);
    
    console.log(`Successfully connected to MongoDB!`);
    console.log(`Database: [${DB_NAME}] | Collection: [${COLLECTION_NAME}]`);

    // Optional: Seed initial demo data if collection is completely empty
    const count = await studentsCollection.countDocuments();
    if (count === 0) {
      console.log('Students collection is empty. Seeding initial student records into MongoDB...');
      const sampleStudents = [
        {
          name: 'Aarav Sharma',
          registerNumber: 'REG2026001',
          department: 'Computer Science and Engineering',
          course: 'Full Stack Web Development',
          createdAt: new Date().toISOString()
        },
        {
          name: 'Priya Patel',
          registerNumber: 'REG2026002',
          department: 'Artificial Intelligence and Data Science',
          course: 'Artificial Intelligence',
          createdAt: new Date().toISOString()
        },
        {
          name: 'Rohan Verma',
          registerNumber: 'REG2026003',
          department: 'Information Technology',
          course: 'Python Programming',
          createdAt: new Date().toISOString()
        }
      ];
      await studentsCollection.insertMany(sampleStudents);
      console.log(`Successfully inserted ${sampleStudents.length} initial students into MongoDB.`);
    }
  } catch (error) {
    console.error('CRITICAL: Failed to connect to MongoDB:', error.message);
    console.error('Please ensure MongoDB is running and MONGO_URI in .env is correct.');
  }
}

// Ensure database connection middleware
const ensureDbConnection = (req, res, next) => {
  if (!studentsCollection) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please verify MongoDB server is running.'
    });
  }
  next();
};

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// 1. Health check & status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Educational Course Portal API',
    database: studentsCollection ? 'CONNECTED' : 'DISCONNECTED',
    dbName: DB_NAME,
    collection: COLLECTION_NAME,
    timestamp: new Date().toISOString()
  });
});

/**
 * 2. READ: GET /api/students
 * Retrieve all students or filter by department using query parameter:
 * e.g., GET /api/students?department=CSE
 */
app.get('/api/students', ensureDbConnection, async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};

    if (department && department.trim() !== '' && department.toLowerCase() !== 'all') {
      // Case-insensitive regex match for flexible department search
      query.department = { $regex: new RegExp(department.trim(), 'i') };
    }

    // Compulsory requirement: Use find({}).toArray()
    const students = await studentsCollection.find(query).sort({ _id: -1 }).toArray();

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error in GET /api/students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students from database',
      error: error.message
    });
  }
});

/**
 * 3. CREATE: POST /api/students
 * Add a new student record
 * Compulsory requirement: Use insertOne() to insert records into MongoDB.
 */
app.post('/api/students', ensureDbConnection, async (req, res) => {
  try {
    const { name, registerNumber, department, course } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student Name is required' });
    }
    if (!registerNumber || !registerNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Register Number is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ success: false, message: 'Selected Course is required' });
    }

    // Check if register number already exists in MongoDB
    const existingStudent = await studentsCollection.findOne({
      registerNumber: registerNumber.trim()
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with Register Number "${registerNumber.trim()}" already exists.`
      });
    }

    const newStudent = {
      name: name.trim(),
      registerNumber: registerNumber.trim(),
      department: department.trim(),
      course: course.trim(),
      createdAt: new Date().toISOString()
    };

    // Compulsory requirement: Use insertOne()
    const result = await studentsCollection.insertOne(newStudent);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully in MongoDB!',
      data: {
        _id: result.insertedId,
        ...newStudent
      }
    });
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add student to database',
      error: error.message
    });
  }
});

/**
 * 4. UPDATE: PUT /api/students/:id
 * Update an existing student record
 * Compulsory requirement: Use updateOne() with $set.
 */
app.put('/api/students/:id', ensureDbConnection, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, registerNumber, department, course } = req.body;

    // Validate MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID format: "${id}". Must be a valid 24-character hex string.`
      });
    }

    // Validation of update fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student Name is required' });
    }
    if (!registerNumber || !registerNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Register Number is required' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }

    // Check if register number is taken by another student
    const duplicate = await studentsCollection.findOne({
      registerNumber: registerNumber.trim(),
      _id: { $ne: new ObjectId(id) }
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Register Number "${registerNumber.trim()}" is already assigned to another student.`
      });
    }

    const updateDoc = {
      $set: {
        name: name.trim(),
        registerNumber: registerNumber.trim(),
        department: department.trim(),
        course: course.trim(),
        updatedAt: new Date().toISOString()
      }
    };

    // Compulsory requirement: Use updateOne() with $set
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No student found with ID: ${id}`
      });
    }

    // Fetch the updated student document
    const updatedStudent = await studentsCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Student details updated successfully in MongoDB!',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Error in PUT /api/students/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student in database',
      error: error.message
    });
  }
});

/**
 * 5. DELETE: DELETE /api/students/:id
 * Delete a student record
 * Compulsory requirement: Use deleteOne().
 */
app.delete('/api/students/:id', ensureDbConnection, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID format: "${id}". Must be a valid 24-character hex string.`
      });
    }

    // Compulsory requirement: Use deleteOne()
    const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No student found with ID: ${id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully from MongoDB!',
      deletedId: id
    });
  } catch (error) {
    console.error('Error in DELETE /api/students/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student from database',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Educational Course Portal API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; }
          .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 600px; border: 1px solid #334155; }
          h1 { color: #818cf8; margin-top: 0; }
          code { background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; }
          ul { line-height: 1.8; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #22c55e20; color: #4ade80; border: 1px solid #22c55e40; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Educational Course Portal Backend API</h1>
          <p><span class="badge">RUNNING ON PORT ${PORT}</span></p>
          <p>Experiment No. 12: Full Stack Web Application Development Using Node.js, React.js and MongoDB</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><code>GET /api/health</code> - API & Database health</li>
            <li><code>GET /api/students</code> - Retrieve all students</li>
            <li><code>GET /api/students?department=CSE</code> - Search by department</li>
            <li><code>POST /api/students</code> - Add student (insertOne)</li>
            <li><code>PUT /api/students/:id</code> - Update student (updateOne with $set)</li>
            <li><code>DELETE /api/students/:id</code> - Delete student (deleteOne)</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Start Express server and connect to MongoDB
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Educational Course Portal Server running at http://localhost:${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/students`);
  });
}

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});

