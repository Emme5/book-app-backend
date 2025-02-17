const express = require('express');
const { getUserFavorites, updateUserFavorites } = require('./favorite.controller');
const router = express.Router();

// เส้นทางดึงรายการหนังสือโปรด
router.get('/:userId', getUserFavorites);

// เส้นทางอัปเดตรายการหนังสือโปรด
router.post('/:userId', updateUserFavorites);

module.exports = router;