const pool = require('../config/db');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  return {
    username: profile.login,
    name: profile.name,
    public_repos: profile.public_repos,
    followers: profile.followers,
    languages,
    repos: repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url
    }))
  };
};

const analyseProject = async (req, res) => {
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

    // Get job requirements
    const requirementsResult = await pool.query(
      'SELECT * FROM job_requirements WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );

    if (requirementsResult.rows.length === 0) {
      return res.status(400).json({ message: 'No job requirements found for this project' });
    }

    const requirements = requirementsResult.rows[0].requirements_text;

    // Get all candidates
    const candidatesResult = await pool.query(
      'SELECT * FROM candidates WHERE project_id = $1',
      [projectId]
    );

    if (candidatesResult.rows.length === 0) {
      return res.status(400).json({ message: 'No candidates found in this project' });
    }

    // Fetch GitHub data for all candidates
    const candidatesWithData = await Promise.all(
      candidatesResult.rows.map(async (candidate) => {
        try {
          const githubData = await getGithubData(candidate.github_username);
          return { ...candidate, githubData };
        } catch (err) {
          return { ...candidate, githubData: null };
        }
      })
    );

    // Build prompt for Gemini
    const candidatesSummary = candidatesWithData.map(c => {
      if (!c.githubData) return `${c.github_username}: GitHub data unavailable`;
      return `
Candidate: ${c.githubData.username} (${c.githubData.name || 'No name'})
Public Repos: ${c.githubData.public_repos}
Followers: ${c.githubData.followers}
Languages used: ${JSON.stringify(c.githubData.languages)}
Top repos: ${c.githubData.repos.slice(0, 5).map(r => `${r.name} (${r.language || 'unknown'}) - ${r.description || 'no description'}`).join(', ')}
      `;
    }).join('\n---\n');

    const prompt = `
You are a technical recruiter assistant. Analyse the following candidates based on their GitHub profiles and rank them against the job requirements.

JOB REQUIREMENTS:
${requirements}

CANDIDATES:
${candidatesSummary}

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. The format must be exactly:
{
  "ranked_candidates": [
    {
      "username": "github_username",
      "rank": 1,
      "match_score": 85,
      "strengths": ["strength 1", "strength 2"],
      "gaps": ["gap 1", "gap 2"],
      "summary": "Brief summary of why this candidate is a good or bad fit"
    }
  ],
  "analysis_summary": "Overall summary of the candidate pool"
}
`;

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(cleanedResponse);

    // Save result to database
    await pool.query(
      'INSERT INTO ai_results (project_id, result) VALUES ($1, $2)',
      [projectId, JSON.stringify(analysisResult)]
    );

    res.json({
      message: 'Analysis complete',
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRequirements = async (req, res) => {
  const { projectId } = req.params;
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
      'SELECT * FROM job_requirements WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );

    res.json({ requirements: result.rows });

  } catch (error) {
    console.error('Get requirements error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const saveRequirements = async (req, res) => {
  const { projectId } = req.params;
  const { requirements_text } = req.body;
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
      'INSERT INTO job_requirements (project_id, requirements_text) VALUES ($1, $2) RETURNING *',
      [projectId, requirements_text]
    );

    res.status(201).json({
      message: 'Requirements saved successfully',
      requirements: result.rows[0]
    });

  } catch (error) {
    console.error('Save requirements error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLatestAnalysis = async (req, res) => {
  const { projectId } = req.params;
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
      'SELECT * FROM ai_results WHERE project_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No analysis found' });
    }

    res.json({ analysis: result.rows[0] });

  } catch (error) {
    console.error('Get analysis error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { analyseProject, saveRequirements, getRequirements, getLatestAnalysis };