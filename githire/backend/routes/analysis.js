const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const {
  analyseProject,
  saveRequirements,
  getRequirements,
  getLatestAnalysis
} = require('../controllers/analysisController');

router.use(authMiddleware);

router.post('/requirements', saveRequirements);
router.get('/requirements', getRequirements);
router.post('/run', analyseProject);
router.get('/latest', getLatestAnalysis);

module.exports = router;