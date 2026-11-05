import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code,
  Terminal,
  Cpu,
  Database,
  BarChart2,
  Layers,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Server,
  BookCheck,
  ChevronRight
} from 'lucide-react';
import './App.css';

// Base API URL: Uses Vite proxy (/api) or direct backend port (http://localhost:5000/api)
const API_BASE_URL = 'http://localhost:5000/api';

// Pre-defined available courses matching Experiment 12 requirements exactly
const COURSES_DATA = [
  {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Master full-stack modern web engineering with HTML5, CSS3, ES6+ JavaScript, React.js, Express, and RESTful APIs.',
    duration: '12 Weeks (80 Hours)',
    level: 'Beginner to Advanced',
    icon: Code,
    category: 'Full Stack',
    topics: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js Components', 'Node & Express', 'RESTful APIs']
  },
  {
    id: 'python-prog',
    title: 'Python Programming',
    description: 'Learn foundational to advanced Python syntax, object-oriented design, algorithm development, and backend script automation.',
    duration: '10 Weeks (65 Hours)',
    level: 'Beginner to Intermediate',
    icon: Terminal,
    category: 'Programming',
    topics: ['Data Structures', 'OOP Paradigm', 'File Handling', 'Decorators & Generators', 'Standard Library']
  },
  {
    id: 'java-prog',
    title: 'Java Programming',
    description: 'Comprehensive enterprise Java curriculum covering JVM architecture, Object-Oriented concepts, Collections, and JDBC connectivity.',
    duration: '12 Weeks (75 Hours)',
    level: 'Intermediate',
    icon: Layers,
    category: 'Enterprise',
    topics: ['Core Java', 'OOP Principles', 'Collections Framework', 'Multithreading', 'JDBC & SQL']
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Harness data analysis, statistical computing, Pandas, NumPy, predictive modeling, data visualization, and exploratory analytics.',
    duration: '14 Weeks (90 Hours)',
    level: 'Intermediate to Advanced',
    icon: BarChart2,
    category: 'Analytics',
    topics: ['NumPy & Pandas', 'Data Wrangling', 'Matplotlib & Seaborn', 'Statistical Modeling', 'Machine Learning Basics']
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence',
    description: 'Deep dive into intelligent systems, search algorithms, heuristic agents, neural architectures, and applied computer vision.',
    duration: '16 Weeks (100 Hours)',
    level: 'Advanced',
    icon: Cpu,
    category: 'AI & ML',
    topics: ['Heuristic Search', 'Neural Networks', 'Natural Language Processing', 'Computer Vision', 'Deep Learning Basics']
  },
  {
    id: 'dbms',
    title: 'Database Management System',
    description: 'Understand relational and NoSQL database architecture, ER modeling, SQL normalization, MongoDB querying, indexing, and transactions.',
    duration: '8 Weeks (50 Hours)',
    level: 'All Levels',
    icon: Database,
    category: 'Data Engineering',
    topics: ['Relational Schema Design', 'SQL & Normalization', 'MongoDB & NoSQL', 'Indexing Strategies', 'ACID Transactions']
  }
];

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering'
];

export default function App() {
  // State for students retrieved from MongoDB
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('CHECKING'); // CONNECTED | DISCONNECTED | CHECKING

  // State for alerts & notifications
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger' | 'info', message: string }

  // State for Add Student Form
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: 'Computer Science and Engineering',
    course: 'Web Development'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Edit Student Modal
  const [editModal, setEditModal] = useState({
    isOpen: false,
    student: null
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    registerNumber: '',
    department: '',
    course: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // State for Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    student: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Search states
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Helper to show auto-dismissing alerts
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // Check backend and MongoDB connection status
  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.database === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED');
      } else {
        setDbStatus('DISCONNECTED');
      }
    } catch (err) {
      setDbStatus('DISCONNECTED');
    }
  };

  /**
   * READ: Retrieve student records from MongoDB
   * Supports department-based query: GET /api/students?department=CSE
   */
  const fetchStudents = async (dept = selectedDeptFilter) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/students`;
      if (dept && dept !== 'All') {
        url += `?department=${encodeURIComponent(dept)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (response.ok && result.success) {
        setStudents(result.data || []);
      } else {
        showAlert('danger', result.message || 'Failed to fetch students from MongoDB.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showAlert('danger', 'Unable to reach backend server. Please verify Express server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: check health and fetch students
  useEffect(() => {
    checkHealth();
    fetchStudents('All');
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle department filter tab selection
  const handleDepartmentFilterChange = (dept) => {
    setSelectedDeptFilter(dept);
    fetchStudents(dept);
  };

  /**
   * CREATE: POST /api/students
   * Insert new student into MongoDB using insertOne()
   */
  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.registerNumber.trim()) {
      showAlert('danger', 'Please fill in both Student Name and Register Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('success', `Success: Student "${formData.name}" was registered into MongoDB!`);
        // Reset form to defaults
        setFormData({
          name: '',
          registerNumber: '',
          department: 'Computer Science and Engineering',
          course: 'Web Development'
        });
        // Compulsory: Automatically refresh student list
        fetchStudents(selectedDeptFilter);
      } else {
        showAlert('danger', result.message || 'Error adding student record.');
      }
    } catch (err) {
      showAlert('danger', 'Network error while contacting Express backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Open Edit modal with selected student details
   */
  const openEditModal = (student) => {
    setEditModal({ isOpen: true, student });
    setEditFormData({
      name: student.name || '',
      registerNumber: student.registerNumber || '',
      department: student.department || DEPARTMENTS[0],
      course: student.course || COURSES_DATA[0].title
    });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, student: null });
  };

  /**
   * UPDATE: PUT /api/students/:id
   * Update student details in MongoDB using updateOne() with $set
   */
  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.student) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/${editModal.student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('success', `Student "${editFormData.name}" updated successfully in MongoDB!`);
        closeEditModal();
        // Compulsory: Refresh student list automatically
        fetchStudents(selectedDeptFilter);
      } else {
        showAlert('danger', result.message || 'Error updating student record.');
      }
    } catch (err) {
      showAlert('danger', 'Network error while updating student.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Open Delete Confirmation Modal
   */
  const openDeleteModal = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, student: null });
  };

  /**
   * DELETE: DELETE /api/students/:id
   * Remove student record from MongoDB using deleteOne()
   */
  const handleConfirmDelete = async () => {
    if (!deleteModal.student) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/${deleteModal.student._id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert('success', `Student record "${deleteModal.student.name}" deleted from MongoDB.`);
        closeDeleteModal();
        // Compulsory: Refresh student list automatically
        fetchStudents(selectedDeptFilter);
      } else {
        showAlert('danger', result.message || 'Error deleting student.');
      }
    } catch (err) {
      showAlert('danger', 'Network error while deleting student.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pre-fill course selection from course cards and scroll to registration
  const selectCourseAndScroll = (courseTitle) => {
    setFormData(prev => ({ ...prev, course: courseTitle }));
    const regSection = document.getElementById('registration');
    if (regSection) {
      regSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Client-side text search filtering
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const nameMatch = student.name?.toLowerCase().includes(query);
    const regMatch = student.registerNumber?.toLowerCase().includes(query);
    const courseMatch = student.course?.toLowerCase().includes(query);
    const deptMatch = student.department?.toLowerCase().includes(query);
    return nameMatch || regMatch || courseMatch || deptMatch;
  });

  // Handle contact form mock submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="app-root">
      {/* ==========================================================================
          1. NAVIGATION BAR
          ========================================================================== */}
      <nav className="navbar">
        <div className="container nav-container">
          <a href="#home" className="brand">
            <div className="brand-icon-wrap">
              <GraduationCap size={26} />
            </div>
            <div className="brand-text">
              <span className="brand-title">EduPortal</span>
              <span className="brand-tag">Course & Student System</span>
            </div>
          </a>

          <ul className="nav-links">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#courses" className="nav-link">Courses</a></li>
            <li><a href="#registration" className="nav-link">Registration</a></li>
            <li><a href="#dashboard" className="nav-link">Dashboard</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>

          <div className="nav-actions">
            <div className="db-pill" title="Live status with backend and MongoDB">
              <span className={`db-dot ${dbStatus === 'CONNECTED' ? '' : 'offline'}`}></span>
              <span>{dbStatus === 'CONNECTED' ? 'MongoDB: Online' : 'MongoDB: Offline'}</span>
            </div>
            <a href="#registration" className="btn-nav-cta">Enroll Now</a>
          </div>
        </div>
      </nav>

      {/* ==========================================================================
          GLOBAL ALERT BANNER
          ========================================================================== */}
      {alert && (
        <div className="container" style={{ marginTop: '20px' }}>
          <div className={`alert-banner ${alert.type}`}>
            <div className="alert-content">
              {alert.type === 'success' && <CheckCircle2 size={20} />}
              {alert.type === 'danger' && <AlertCircle size={20} />}
              {alert.type === 'info' && <Sparkles size={20} />}
              <span>{alert.message}</span>
            </div>
            <button className="alert-close" onClick={() => setAlert(null)}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
          2. HERO SECTION ("Learn Today, Lead Tomorrow")
          ========================================================================== */}
      <header id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Experiment No. 12 • Full Stack Node.js, React.js & MongoDB</span>
            </div>
            <h1 className="hero-title">
              Learn Today, <br />
              <span className="gradient-text">Lead Tomorrow</span>
            </h1>
            <p className="hero-subtitle">
              Welcome to the official Educational Course Portal. Explore professional engineering 
              curriculums, enroll in industry-aligned technical tracks, and seamlessly manage student 
              records backed by a high-performance MongoDB database.
            </p>

            <div className="hero-cta-group">
              <a href="#courses" className="btn-primary">
                <BookOpen size={18} />
                Explore Courses
              </a>
              <a href="#registration" className="btn-secondary">
                <PlusCircle size={18} />
                Register Student
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-card">
                <span className="hero-stat-num">6</span>
                <span className="hero-stat-label">Core Courses</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-num">{students.length}</span>
                <span className="hero-stat-label">Enrolled Students</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-num">100%</span>
                <span className="hero-stat-label">MongoDB Driver</span>
              </div>
            </div>
          </div>

          <div className="hero-card-preview">
            <div className="hero-preview-header">
              <span className="preview-title">Live Database Sync</span>
              <span className="preview-badge">EducationalPortal.Students</span>
            </div>
            <div className="preview-list">
              <div className="preview-item">
                <div className="preview-item-info">
                  <div className="preview-item-icon"><Code size={18} /></div>
                  <div>
                    <div className="preview-item-name">Web Development</div>
                    <div className="preview-item-sub">MERN Stack Architecture</div>
                  </div>
                </div>
                <span className="preview-item-tag">12 Weeks</span>
              </div>

              <div className="preview-item">
                <div className="preview-item-info">
                  <div className="preview-item-icon"><Cpu size={18} /></div>
                  <div>
                    <div className="preview-item-name">Artificial Intelligence</div>
                    <div className="preview-item-sub">Neural Networks & Deep Learning</div>
                  </div>
                </div>
                <span className="preview-item-tag">16 Weeks</span>
              </div>

              <div className="preview-item">
                <div className="preview-item-info">
                  <div className="preview-item-icon"><Database size={18} /></div>
                  <div>
                    <div className="preview-item-name">Database Management</div>
                    <div className="preview-item-sub">MongoDB Driver & SQL Engine</div>
                  </div>
                </div>
                <span className="preview-item-tag">8 Weeks</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================================================
          3. ABOUT SECTION
          ========================================================================== */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About Our Platform</span>
            <h2 className="section-title">Architected for Academic Excellence</h2>
            <p className="section-subtitle">
              Designed as a comprehensive full-stack solution integrating Node.js, Express.js, 
              React.js, and native MongoDB driver technology for robust course distribution and real-time student lifecycle tracking.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon"><Server size={28} /></div>
              <h3>Node & Express Backend</h3>
              <p>A decoupled RESTful API layer running on port 5000 providing complete endpoints for student creation, retrieval, updates, and deletion.</p>
            </div>

            <div className="about-card">
              <div className="about-icon"><Database size={28} /></div>
              <h3>Native MongoDB Driver</h3>
              <p>Direct interaction with MongoDB collections via <code>insertOne()</code>, <code>find().toArray()</code>, <code>updateOne()</code>, and <code>deleteOne()</code>.</p>
            </div>

            <div className="about-card">
              <div className="about-icon"><Code size={28} /></div>
              <h3>React.js & Vite Frontend</h3>
              <p>Lightning-fast single page application utilizing React functional components, hooks, dynamic reactive state, and responsive styles.</p>
            </div>

            <div className="about-card">
              <div className="about-icon"><BookCheck size={28} /></div>
              <h3>Course Track Management</h3>
              <p>Curated syllabi covering modern engineering domains from Full Stack Web Development to Artificial Intelligence and Database Systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          4. AVAILABLE COURSES SECTION (6 Required Courses)
          ========================================================================== */}
      <section id="courses" className="section courses-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Curriculum Catalog</span>
            <h2 className="section-title">Available Engineering Courses</h2>
            <p className="section-subtitle">
              Choose from our 6 certified technical programs. Each program features rigorous 
              practical exercises, industry-standard toolchains, and verified certifications.
            </p>
          </div>

          <div className="courses-grid">
            {COURSES_DATA.map((course) => {
              const IconComponent = course.icon;
              let badgeClass = 'beginner';
              if (course.level.includes('Advanced')) badgeClass = 'advanced';
              else if (course.level.includes('Intermediate')) badgeClass = 'intermediate';

              return (
                <div key={course.id} className="course-card">
                  <div>
                    <div className="course-header">
                      <div className="course-icon-wrap">
                        <IconComponent size={24} />
                      </div>
                      <span className={`course-level-badge ${badgeClass}`}>
                        {course.category}
                      </span>
                    </div>

                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-desc">{course.description}</p>
                  </div>

                  <div>
                    <div className="course-meta">
                      <div className="course-duration">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                      </div>
                      <span className="course-level-text">{course.level}</span>
                    </div>

                    <button 
                      className="btn-enroll-course"
                      onClick={() => selectCourseAndScroll(course.title)}
                    >
                      <span>Enroll in this Course</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          5. STUDENT REGISTRATION FORM SECTION
          ========================================================================== */}
      <section id="registration" className="section registration-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Student Enrollment</span>
            <h2 className="section-title">Register for a Course</h2>
            <p className="section-subtitle">
              Enter the student's academic credentials below. Upon submission, the record will be 
              directly stored into the <code>EducationalPortal</code> MongoDB database using <code>insertOne()</code>.
            </p>
          </div>

          <div className="form-wrapper">
            <form onSubmit={handleAddStudentSubmit}>
              <div className="form-grid">
                {/* Student Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="studentName">
                    Student Name <span className="required">*</span>
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Arun Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <span className="form-hint">Full legal name of the candidate</span>
                </div>

                {/* Register Number */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regNumber">
                    Register Number <span className="required">*</span>
                  </label>
                  <input
                    id="regNumber"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2026CSE042"
                    value={formData.registerNumber}
                    onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                    required
                  />
                  <span className="form-hint">Unique institutional register ID</span>
                </div>

                {/* Department */}
                <div className="form-group">
                  <label className="form-label" htmlFor="department">
                    Department <span className="required">*</span>
                  </label>
                  <select
                    id="department"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <span className="form-hint">Academic discipline / faculty</span>
                </div>

                {/* Selected Course */}
                <div className="form-group">
                  <label className="form-label" htmlFor="course">
                    Selected Course <span className="required">*</span>
                  </label>
                  <select
                    id="course"
                    className="form-control"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                  >
                    {COURSES_DATA.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                  <span className="form-hint">Curriculum path chosen</span>
                </div>
              </div>

              <div className="form-submit-row">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="spin" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>Add Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          6. STUDENT MANAGEMENT DASHBOARD SECTION
          ========================================================================== */}
      <section id="dashboard" className="section dashboard-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Administrative Center</span>
            <h2 className="section-title">Student Management Dashboard</h2>
            <p className="section-subtitle">
              Inspect, filter, search, update, and manage all enrolled student documents stored inside MongoDB.
            </p>
          </div>

          <div className="dashboard-toolbar">
            <div className="toolbar-header">
              <div className="toolbar-title-wrap">
                <Users size={22} color="var(--primary-blue)" />
                <h3 className="toolbar-title">Registered Students</h3>
                <span className="count-badge">{filteredStudents.length} Records</span>
              </div>

              <div className="search-box-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Quick search student or reg no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-filters">
              <div className="dept-filter-group">
                <span className="dept-filter-label">Filter Department (API Query):</span>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'All' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('All')}
                >
                  All
                </button>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'Computer Science and Engineering' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('Computer Science and Engineering')}
                >
                  CSE
                </button>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'Information Technology' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('Information Technology')}
                >
                  IT
                </button>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'Artificial Intelligence and Data Science' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('Artificial Intelligence and Data Science')}
                >
                  AI & DS
                </button>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'Electronics and Communication Engineering' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('Electronics and Communication Engineering')}
                >
                  ECE
                </button>
                <button
                  className={`dept-btn ${selectedDeptFilter === 'Mechanical Engineering' ? 'active' : ''}`}
                  onClick={() => handleDepartmentFilterChange('Mechanical Engineering')}
                >
                  Mech
                </button>
              </div>

              <button 
                className="btn-cancel" 
                onClick={() => fetchStudents(selectedDeptFilter)}
                title="Reload latest records from MongoDB"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="table-card">
            {loading && students.length === 0 ? (
              <div className="empty-state">
                <RefreshCw size={36} className="spin" style={{ margin: '0 auto 16px', color: 'var(--primary-blue)' }} />
                <h3>Connecting to MongoDB...</h3>
                <p>Retrieving student documents from the database.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={32} />
                </div>
                <h3>No Students Found</h3>
                <p>
                  {searchQuery || selectedDeptFilter !== 'All' 
                    ? 'No registered students match your filter criteria. Try resetting filters or search query.'
                    : 'No student records exist in MongoDB yet. Use the registration form above to enroll your first student!'}
                </p>
                {(searchQuery || selectedDeptFilter !== 'All') && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => { setSearchQuery(''); handleDepartmentFilterChange('All'); }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Register Number</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Selected Course</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <tr key={student._id || idx}>
                        <td style={{ color: 'var(--slate-light)', fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <span className="reg-no-badge">
                            {student.registerNumber || 'REG-UNASSIGNED'}
                          </span>
                        </td>
                        <td className="student-name-cell">{student.name}</td>
                        <td>
                          <span className="dept-badge">
                            {student.department || 'General'}
                          </span>
                        </td>
                        <td>
                          <span className="course-badge">
                            {student.course}
                          </span>
                        </td>
                        <td>
                          <div className="actions-cell" style={{ justifyContent: 'center' }}>
                            <button
                              className="btn-action edit"
                              title="Edit Student Details"
                              onClick={() => openEditModal(student)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-action delete"
                              title="Delete Student Record"
                              onClick={() => openDeleteModal(student)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          7. EDIT STUDENT MODAL (PUT /api/students/:id with updateOne)
          ========================================================================== */}
      {editModal.isOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Student Details</h3>
              <button className="modal-close-btn" onClick={closeEditModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Register Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.registerNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, registerNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-control"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    required
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-control"
                    value={editFormData.course}
                    onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                    required
                  >
                    {COURSES_DATA.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeEditModal} disabled={isUpdating}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isUpdating}>
                  {isUpdating ? 'Updating in MongoDB...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          8. DELETE CONFIRMATION MODAL (DELETE /api/students/:id with deleteOne)
          ========================================================================== */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trash2 size={20} color="#dc2626" />
                <h3 className="modal-title" style={{ color: '#991b1b' }}>Confirm Deletion</h3>
              </div>
              <button className="modal-close-btn" onClick={closeDeleteModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--slate-dark)', fontSize: '0.98rem' }}>
                Are you sure you want to permanently delete the student record for:
              </p>
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{deleteModal.student?.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-light)' }}>
                  Reg No: {deleteModal.student?.registerNumber} • {deleteModal.student?.department}
                </div>
              </div>
              <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px' }}>
                * This will execute <code>deleteOne()</code> on the MongoDB database collection.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={closeDeleteModal} disabled={isDeleting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ background: '#dc2626' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          9. CONTACT SECTION
          ========================================================================== */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Get in Touch</span>
            <h2 className="section-title">Academic Support & Contact</h2>
            <p className="section-subtitle">
              Have questions regarding course requirements or technical certifications? Reach out to the academic team.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info-card">
              <div>
                <h3 className="contact-info-title">Portal Administration</h3>
                <p className="contact-info-text">
                  Our academic helpdesk is available Monday through Saturday to address enrollment queries,
                  course syllabus walkthroughs, and database record verification.
                </p>

                <div className="contact-details-list">
                  <div className="contact-item">
                    <div className="contact-item-icon"><MapPin size={20} /></div>
                    <div>
                      <div className="contact-item-title">Campus Location</div>
                      <div className="contact-item-val">Department of Computer Science & Engineering</div>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-item-icon"><Mail size={20} /></div>
                    <div>
                      <div className="contact-item-title">Official Email</div>
                      <div className="contact-item-val">eduportal@university.edu.in</div>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="contact-item-icon"><Phone size={20} /></div>
                    <div>
                      <div className="contact-item-title">Academic Hotline</div>
                      <div className="contact-item-val">+91 (044) 2850-2026</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '30px', fontSize: '0.85rem', color: '#94a3b8' }}>
                Office Hours: Mon – Fri: 9:00 AM – 5:00 PM IST
              </div>
            </div>

            <div className="contact-form-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--navy-dark)' }}>
                Send an Academic Inquiry
              </h3>

              {contactSuccess && (
                <div className="alert-banner success" style={{ marginBottom: '16px' }}>
                  <CheckCircle2 size={18} />
                  <span>Your message has been dispatched to academic counselors!</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="student@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Inquiry</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Ask about syllabus, schedules or prerequisites..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          10. FOOTER
          ========================================================================== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="brand-icon-wrap" style={{ width: '36px', height: '36px' }}>
                  <GraduationCap size={20} />
                </div>
                <span className="brand-title" style={{ fontSize: '1.2rem', color: '#fff' }}>EduPortal</span>
              </div>
              <p className="footer-desc">
                Educational Course Portal created as part of Experiment No. 12: Full Stack Web Application Development 
                Using Node.js, React.js and MongoDB.
              </p>
            </div>

            <div>
              <h4 className="footer-col-title">Portal Navigation</h4>
              <ul className="footer-links">
                <li><a href="#home" className="footer-link">Home</a></li>
                <li><a href="#courses" className="footer-link">Available Courses</a></li>
                <li><a href="#registration" className="footer-link">Student Registration</a></li>
                <li><a href="#dashboard" className="footer-link">Management Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Technology Stack</h4>
              <ul className="footer-links">
                <li className="footer-link">Frontend: React.js & Vite</li>
                <li className="footer-link">Backend: Node.js & Express</li>
                <li className="footer-link">Database: MongoDB Driver</li>
                <li className="footer-link">Architecture: Full Stack MERN</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 EduPortal. All Rights Reserved.</span>
            <span className="experiment-badge">
              Experiment No. 12 • Node.js + React.js + MongoDB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

