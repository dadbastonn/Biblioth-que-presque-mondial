const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Profil utilisateur
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, firstname, lastname, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Statistiques utilisateur
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const filesCount = await db.query('SELECT COUNT(*) FROM files WHERE user_id = $1', [req.userId]);
    const foldersCount = await db.query('SELECT COUNT(*) FROM folders WHERE user_id = $1', [req.userId]);
    const totalSize = await db.query('SELECT SUM(file_size) FROM files WHERE user_id = $1', [req.userId]);

    res.json({
      files: parseInt(filesCount.rows[0].count),
      folders: parseInt(foldersCount.rows[0].count),
      totalSize: totalSize.rows[0].sum || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

module.exports = router;
