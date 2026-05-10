const pool = require('../config/db');

const createProject = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, description]
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({ projects: result.rows });

  } catch (error) {
    console.error('Get projects error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project: result.rows[0] });

  } catch (error) {
    console.error('Get project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Update project error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProject, getProjects, getProject, deleteProject, updateProject };