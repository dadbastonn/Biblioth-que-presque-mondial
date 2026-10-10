import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setHistory(res.data.actions || []);
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="layout-shell py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Historique</h1>
          <p className="text-slate-600">Suivi des actions de votre bibliothèque</p>
        </div>
        <Link to="/dashboard" className="btn btn-primary">Retour au tableau de bord</Link>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="text-slate-500">Chargement...</p>
        ) : history.length === 0 ? (
          <p className="text-slate-500">Aucune action enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">{item.action_type}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
