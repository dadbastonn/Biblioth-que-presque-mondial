import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        ...formData,
        device_info: {
          name: 'Web Browser',
          user_agent: navigator.userAgent
        }
      });

      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Connexion impossible');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bibliothèque</h1>
        <p className="text-slate-600 mb-6">Connectez-vous pour accéder à vos fichiers</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            Se connecter
          </button>
        </form>

        <p className="text-center text-slate-600 mt-5">
          Pas encore inscrit ?{' '}
          <Link to="/register" className="text-blue-600 font-semibold">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
