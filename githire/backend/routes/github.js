const express = require('express');
const router = express.Router();
const { getGithubProfile } = require('../controllers/githubController');

router.get('/:username', getGithubProfile);

module.exports = router;