import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [stats, setStats] = useState({ files: 0, folders: 0, totalSize: 0 });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login');
    loadData();
  }, [token, currentFolder]);

  const loadData = async () => {
    try {
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      const filesRes = await axios.get(
        `${API_URL}/files${currentFolder ? `?folder_id=${currentFolder}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(filesRes.data);

      const foldersRes = await axios.get(
        `${API_URL}/folders${currentFolder ? `?parent_id=${currentFolder}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFolders(foldersRes.data);

      const statsRes = await axios.get(`${API_URL}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreateFolder = async (e) => {
    const folderName = prompt('Nom du dossier:');
    if (!folderName) return;

    try {
      await axios.post(
        `${API_URL}/folders`,
        { folder_name: folderName, parent_folder_id: currentFolder },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      alert('Erreur lors de la création du dossier');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    formData.append('folder_id', currentFolder);

    try {
      await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      loadData();
    } catch (error) {
      alert('Erreur lors de l\'upload');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Êtes-vous sûr?')) return;
    try {
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bibliothèque</h1>
            <p className="text-gray-600">{user?.firstname} {user?.lastname}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Fichiers</p>
          <p className="text-2xl font-bold text-blue-500">{stats.files}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Dossiers</p>
          <p className="text-2xl font-bold text-green-500">{stats.folders}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Espace utilisé</p>
          <p className="text-2xl font-bold text-purple-500">{(stats.totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-x-2">
        <button
          onClick={handleCreateFolder}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Créer un dossier
        </button>
        <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer inline-block">
          + Importer un fichier
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">Contenu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setCurrentFolder(folder.id)}
              className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer transition"
            >
              <div className="text-3xl mb-2">📁</div>
              <p className="font-semibold">{folder.folder_name}</p>
              <p className="text-sm text-gray-500">{new Date(folder.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {files.map((file) => (
            <div key={file.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">📄</div>
              <p className="font-semibold truncate">{file.filename}</p>
              <p className="text-sm text-gray-500">{(file.file_size / 1024).toFixed(2)} KB</p>
              <div className="flex space-x-2 mt-2">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Télécharger
                </a>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
