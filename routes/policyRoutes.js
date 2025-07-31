const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Policy routes
router.get('/list', policyController.getUserPolicies);
router.get('/:id', policyController.getPolicyById);
router.post('/create', policyController.createPolicy);
router.put('/:id/cancel', policyController.cancelPolicy);
router.get('/:id/claims', policyController.getPolicyClaims);
router.post('/:id/renew', policyController.renewPolicy);

module.exports = router; 