const axios = require('axios');

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

const getGithubProfile = async (req, res) => {
  const { username } = req.params;

  try {
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
      // Also count technologies mentioned in topics
      if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach(topic => {
          const formatted = topic.charAt(0).toUpperCase() + topic.slice(1);
          if (!languages[formatted]) {
            languages[formatted] = 0;
          }
          languages[formatted] += 0.5;
        });
      }
    });

    const topRepos = reposWithReadmes
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        url: repo.html_url,
        updated_at: repo.updated_at,
        readme: repo.readme
      }));

    const activity = {};
    reposWithReadmes.forEach(repo => {
      const month = repo.updated_at?.substring(0, 7);
      if (month) activity[month] = (activity[month] || 0) + 1;
    });

    res.json({
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
      allRepos: reposWithReadmes.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        url: repo.html_url,
        updated_at: repo.updated_at
      }))
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    console.error('GitHub fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch GitHub profile' });
  }
};

module.exports = { getGithubProfile };