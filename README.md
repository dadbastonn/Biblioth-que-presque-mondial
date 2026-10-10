# Bibliothèque Mondiale - Plateforme Web

Une plateforme complète de gestion de bibliothèque avec inscription utilisateur, importation de fichiers, création de dossiers, et suivi d'historique.

## Architecture

### Frontend
- **Frontend**: React.js + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux
- **API Client**: Axios

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: Cloudinary/AWS S3
- **Session Management**: Redis (optionnel pour device tracking)

## Fonctionnalités

✅ Inscription et connexion utilisateur
✅ Importation de fichiers (PDF, EPUB, etc.)
✅ Création de dossiers personnalisés
✅ Gestion des permissions
✅ Historique d'actions utilisateur
✅ Reconnaissance d'appareil
✅ Recherche et filtrage
✅ Partage de collections (optionnel)

## Structure du projet

```
.
├── backend/           # API Node.js + Express
├── frontend/          # Application React
├── database/          # Scripts de migration DB
└── docker-compose.yml # Orchestration des services
```

## Démarrage rapide

Voir les README dans `backend/` et `frontend/` pour les instructions d'installation.
