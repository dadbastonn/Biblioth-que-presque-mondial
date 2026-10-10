const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload de fichier
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { folder_id, file_name } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Upload vers Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: `bibliotheque/${req.userId}` },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Upload failed' });
        }

        const fileId = uuidv4();
        await db.query(
          `INSERT INTO files (id, user_id, folder_id, filename, file_url, file_type, file_size, uploaded_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            fileId,
            req.userId,
            folder_id || null,
            file_name || req.file.originalname,
            result.secure_url,
            req.file.mimetype,
            req.file.size
          ]
        );

        // Ajouter à l'historique
        await db.query(
          `INSERT INTO history (id, user_id, action_type, target_id, target_type, description) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), req.userId, 'file_upload', fileId, 'file', `Fichier '${file_name || req.file.originalname}' téléchargé`]
        );

        res.json({ message: 'File uploaded', fileId, url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload error' });
  }
});

// Lister les fichiers de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { folder_id } = req.query;
    let query = 'SELECT * FROM files WHERE user_id = $1';
    const params = [req.userId];

    if (folder_id) {
      query += ' AND folder_id = $2';
      params.push(folder_id);
    } else {
      query += ' AND folder_id IS NULL';
    }

    const result = await db.query(query + ' ORDER BY uploaded_at DESC', params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Supprimer un fichier
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const file = await db.query('SELECT * FROM files WHERE id = $1 AND user_id = $2', [id, req.userId]);

    if (file.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    await db.query('DELETE FROM files WHERE id = $1', [id]);

    // Ajouter à l'historique
    await db.query(
      `INSERT INTO history (id, user_id, action_type, target_id, target_type, description) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), req.userId, 'file_delete', id, 'file', `Fichier supprimé`]
    );

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
