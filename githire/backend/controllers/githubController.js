const axios = require('axios');

const getGithubProfile = async (req, res) => {
  const { username } = req.params;

  try {
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

    const activity = {};
    repos.forEach(repo => {
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
      allRepos: repos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
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