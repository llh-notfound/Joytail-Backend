const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get points record
router.get('/record', protect, (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: 0,
      balance: 0,
      items: []
    }
  });
});

// Get points goods
router.get('/goods', protect, (req, res) => {
  res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      total: 0,
      items: []
    }
  });
});

// Exchange points
router.post('/exchange', protect, (req, res) => {
  res.status(200).json({
    code: 200,
    message: '兑换成功',
    data: {
      exchangeId: 'exch' + Date.now()
    }
  });
});

module.exports = router; 