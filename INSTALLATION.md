# Guide d'installation - Bibliothèque Mondiale

## Prérequis

- Node.js 16+
- PostgreSQL 12+
- Docker et Docker Compose (optionnel)
- Compte Cloudinary (pour le stockage de fichiers)

## Installation avec Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone <repo-url>
cd Biblioth-que-presque-mondial

# 2. Checkout la branche
git checkout website-library

# 3. Créer le fichier .env
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials Cloudinary

# 4. Lancer les services
docker-compose up -d

# 5. Appliquer les migrations
docker exec bibliotheque-api npm run migrate
```

Accès :
- Frontend: http://localhost:3000
- API: http://localhost:5000
- PostgreSQL: localhost:5432

## Installation manuelle

### Backend

```bash
cd backend
npm install

# Créer la base de données
psql -U postgres -c "CREATE DATABASE bibliotheque;"

# Appliquer le schéma
psql -U postgres -d bibliotheque -f ../database/schema.sql

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres

# Lancer le serveur
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Créer le fichier .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Lancer le serveur de développement
npm start
```

## Configuration Cloudinary

1. Créer un compte sur https://cloudinary.com
2. Récupérer votre Cloud Name, API Key et API Secret
3. Ajouter ces valeurs dans backend/.env

## Variables d'environnement

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/bibliotheque
JWT_SECRET=your-secret-key
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Tester l'application

1. Accéder à http://localhost:3000
2. S'inscrire avec un email et un mot de passe
3. Créer des dossiers
4. Importer des fichiers
5. Consulter l'historique

## Troubleshooting

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est lancé
- Vérifier DATABASE_URL dans .env

### Erreur de Cloudinary
- Vérifier que vous avez créé un compte
- Vérifier les credentials dans .env

### CORS errors
- Vérifier FRONTEND_URL dans backend/.env

## Support

Pour toute question, ouvrir une issue sur GitHub.
