const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Lister les appareils de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, device_name, user_agent, ip_address, last_login FROM devices WHERE user_id = $1 ORDER BY last_login DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching devices' });
  }
});

// Supprimer un appareil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM devices WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ message: 'Device removed' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing device' });
  }
});

module.exports = router;
