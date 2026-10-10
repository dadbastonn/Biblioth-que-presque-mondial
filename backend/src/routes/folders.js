const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Créer un dossier
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { folder_name, parent_folder_id } = req.body;

    if (!folder_name) {
      return res.status(400).json({ error: 'Folder name required' });
    }

    const folderId = uuidv4();
    await db.query(
      `INSERT INTO folders (id, user_id, folder_name, parent_folder_id, created_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [folderId, req.userId, folder_name, parent_folder_id || null]
    );

    // Ajouter à l'historique
    await db.query(
      `INSERT INTO history (id, user_id, action_type, target_id, target_type, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.userId, 'folder_create', folderId, 'folder', `Dossier '${folder_name}' créé`]
    );

    res.status(201).json({ message: 'Folder created', folderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Lister les dossiers de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { parent_id } = req.query;
    let query = 'SELECT * FROM folders WHERE user_id = $1';
    const params = [req.userId];

    if (parent_id) {
      query += ' AND parent_folder_id = $2';
      params.push(parent_id);
    } else {
      query += ' AND parent_folder_id IS NULL';
    }

    const result = await db.query(query + ' ORDER BY folder_name ASC', params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Supprimer un dossier
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await db.query('SELECT * FROM folders WHERE id = $1 AND user_id = $2', [id, req.userId]);

    if (folder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Supprimer les fichiers du dossier
    await db.query('DELETE FROM files WHERE folder_id = $1', [id]);
    // Supprimer les sous-dossiers
    await db.query('DELETE FROM folders WHERE parent_folder_id = $1', [id]);
    // Supprimer le dossier
    await db.query('DELETE FROM folders WHERE id = $1', [id]);

    // Ajouter à l'historique
    await db.query(
      `INSERT INTO history (id, user_id, action_type, target_id, target_type, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.userId, 'folder_delete', id, 'folder', 'Dossier supprimé']
    );

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

module.exports = router;
