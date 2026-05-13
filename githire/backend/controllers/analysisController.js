const pool = require('../config/db');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AMBIGUOUS_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Ruby', null];

const getHeaders = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json'
});

const getTopicsHeaders = () => ({
  Authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.mercy-preview+json'
});

const fetchReadme = async (username, repoName) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repoName}/readme`,
      { headers: getHeaders() }
    );
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content.substring(0, 1500);
  } catch {
    return null;
  }
};

const getGithubData = async (username) => {
  const [profileRes, reposRes] = await Promise.all([
    axios.get(`https://api.github.com/users/${username}`, { headers: getHeaders() }),
    axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers: getTopicsHeaders() })
  ]);

  const profile = profileRes.data;
  const repos = reposRes.data;

  // Fetch READMEs for ambiguous language repos in parallel
  const reposWithReadmes = await Promise.all(
    repos.map(async (repo) => {
      let readme = null;
      if (AMBIGUOUS_LANGUAGES.includes(repo.language)) {
        readme = await fetchReadme(username, repo.name);
      }
      return { ...repo, readme };
    })
  );

  const languages = {};
  reposWithReadmes.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    if (repo.topics && repo.topics.length > 0) {
      repo.topics.forEach(topic => {
        const formatted = topic.charAt(0).toUpperCase() + topic.slice(1);
        if (!languages[formatted]) languages[formatted] = 0;
        languages[formatted] += 0.5;
      });
    }
  });

  return {
    username: profile.login,
    name: profile.name,
    public_repos: profile.public_repos,
    followers: profile.followers,
    languages,
    repos: reposWithReadmes.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      url: repo.html_url,
      readme: repo.readme
    }))
  };
};

const generateWithFallback = async (prompt) => {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`Success with model: ${modelName}`);
      return result.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} failed: ${err.message}`);
      if (modelName === models[models.length - 1]) {
        throw new Error(`All models failed. Last error: ${err.message}`);
      }
    }
  }
};

const analyseProject = async (req, res) => {
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

    const requirementsResult = await pool.query(
      'SELECT * FROM job_requirements WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );

    if (requirementsResult.rows.length === 0) {
      return res.status(400).json({ message: 'No job requirements found for this project' });
    }

    const requirements = requirementsResult.rows[0].requirements_text;

    const candidatesResult = await pool.query(
      'SELECT * FROM candidates WHERE project_id = $1',
      [projectId]
    );

    if (candidatesResult.rows.length === 0) {
      return res.status(400).json({ message: 'No candidates found in this project' });
    }

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

    // Build enriched prompt with README content and topics
    const candidatesSummary = candidatesWithData.map(c => {
      if (!c.githubData) return `${c.github_username}: GitHub data unavailable`;

      const topRepos = c.githubData.repos
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 5);

      const repoDetails = topRepos.map(r => {
        const topics = r.topics?.length > 0 ? `Topics: ${r.topics.join(', ')}` : '';
        const readme = r.readme ? `README snippet: ${r.readme.substring(0, 5000)}` : '';
        return `
  - ${r.name} (${r.language || 'unknown'})
    Description: ${r.description || 'none'}
    ${topics}
    ${readme}
        `.trim();
      }).join('\n');

      return `
Candidate: ${c.githubData.username} (${c.githubData.name || 'No name'})
Public Repos: ${c.githubData.public_repos}
Followers: ${c.githubData.followers}
Languages & Technologies: ${JSON.stringify(c.githubData.languages)}
Top Repos:
${repoDetails}
      `.trim();
    }).join('\n---\n');

    const prompt = `
You are a technical recruiter assistant. Analyse the following candidates based on their GitHub profiles and rank them against the job requirements.

Pay close attention to:
- Repo topics (e.g. react, nodejs, docker) as they reveal actual technologies used
- README content which often describes the tech stack more precisely than the language label alone
- A JavaScript repo with React in the README or topics is a React project, not just a JS project

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

    const responseText = await generateWithFallback(prompt);
    const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
    const analysisResult = JSON.parse(cleanedResponse);

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