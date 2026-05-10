const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const candidateRoutes = require('./routes/candidates');
const analysisRoutes = require('./routes/analysis');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/candidates', candidateRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/projects/:projectId/candidates', candidateRoutes);
app.use('/api/projects/:projectId/analysis', analysisRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GitHire API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

