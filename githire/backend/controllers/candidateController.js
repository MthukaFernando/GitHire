const pool = require('../config/db');
const axios = require('axios');

const getGithubData = async (username) => {
  const headers = {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  };

  const [profileRes, reposRes] = await Promise.all([
    axios.get(`https://api.github.com/users/${username}`, { headers }),
    axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers })
  ]);

  const profile = profileRes.data;
  const repos = reposRes.data;

  // Calculate language breakdown
  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Get top repos by stars
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      updated_at: repo.updated_at
    }));

  // Commit activity — repos updated per month
  const activity = {};
  repos.forEach(repo => {
    const month = repo.updated_at?.substring(0, 7);
    if (month) {
      activity[month] = (activity[month] || 0) + 1;
    }
  });

  return {
    profile: {
      username: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      profile_url: profile.html_url,
      created_at: profile.created_at
    },
    languages,
    topRepos,
    activity,
    allRepos: repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      updated_at: repo.updated_at
    }))
  };
};

const addCandidate = async (req, res) => {
  const { github_profile_url } = req.body;
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Extract username from URL
    const username = github_profile_url.replace('https://github.com/', '').replace(/\/$/, '');

    // Check if candidate already exists in this project
    const existingCandidate = await pool.query(
      'SELECT * FROM candidates WHERE project_id = $1 AND github_username = $2',
      [projectId, username]
    );

    if (existingCandidate.rows.length > 0) {
      return res.status(400).json({ message: 'Candidate already exists in this project' });
    }

    // Save candidate
    const result = await pool.query(
      'INSERT INTO candidates (project_id, github_username, github_profile_url) VALUES ($1, $2, $3) RETURNING *',
      [projectId, username, github_profile_url]
    );

    res.status(201).json({
      message: 'Candidate added successfully',
      candidate: result.rows[0]
    });

  } catch (error) {
    console.error('Add candidate error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCandidates = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get all candidates
    const result = await pool.query(
      'SELECT * FROM candidates WHERE project_id = $1 ORDER BY added_at DESC',
      [projectId]
    );

    // Fetch live GitHub data for each candidate
    const candidatesWithData = await Promise.all(
      result.rows.map(async (candidate) => {
        try {
          const githubData = await getGithubData(candidate.github_username);
          return { ...candidate, githubData };
        } catch (err) {
          return { ...candidate, githubData: null };
        }
      })
    );

    res.json({ candidates: candidatesWithData });

  } catch (error) {
    console.error('Get candidates error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCandidate = async (req, res) => {
  const { projectId, candidateId } = req.params;
  const userId = req.user.id;

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await pool.query(
      'SELECT * FROM candidates WHERE id = $1 AND project_id = $2',
      [candidateId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const candidate = result.rows[0];
    const githubData = await getGithubData(candidate.github_username);

    res.json({ candidate: { ...candidate, githubData } });

  } catch (error) {
    console.error('Get candidate error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeCandidate = async (req, res) => {
  const { projectId, candidateId } = req.params;
  const userId = req.user.id;

  try {
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await pool.query(
      'DELETE FROM candidates WHERE id = $1 AND project_id = $2 RETURNING *',
      [candidateId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate removed successfully' });

  } catch (error) {
    console.error('Remove candidate error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addCandidate, getCandidates, getCandidate, removeCandidate };