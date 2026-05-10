const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const {
  addCandidate,
  getCandidates,
  getCandidate,
  removeCandidate
} = require('../controllers/candidateController');

router.use(authMiddleware);

router.post('/', addCandidate);
router.get('/', getCandidates);
router.get('/:candidateId', getCandidate);
router.delete('/:candidateId', removeCandidate);

module.exports = router;