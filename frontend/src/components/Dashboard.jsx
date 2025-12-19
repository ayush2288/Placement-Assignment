/**
 * Dashboard component - Protected route
 * Displays user profile with decrypted Aadhaar number
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setUserData(response.data.user);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        handleLogout();
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh_token: refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar;
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {userData?.full_name || userData?.username}!</h1>
          <p className="dashboard-subtitle">Your secure identity profile</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
          </div>
          <div>
            <h2>{userData?.full_name}</h2>
            <p className="profile-email">{userData?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h3>Personal Information</h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <label>Username</label>
              <p>{userData?.username || 'Not provided'}</p>
            </div>
            
            <div className="detail-item">
              <label>Email Address</label>
              <p>{userData?.email || 'Not provided'}</p>
            </div>
            
            <div className="detail-item">
              <label>First Name</label>
              <p>{userData?.first_name || 'Not provided'}</p>
            </div>
            
            <div className="detail-item">
              <label>Last Name</label>
              <p>{userData?.last_name || 'Not provided'}</p>
            </div>
            
            <div className="detail-item">
              <label>Phone Number</label>
              <p>{userData?.phone_number || 'Not provided'}</p>
            </div>
            
            <div className="detail-item">
              <label>Date of Birth</label>
              <p>{formatDate(userData?.date_of_birth)}</p>
            </div>
          </div>

          <div className="detail-item full-width">
            <label>Address</label>
            <p>{userData?.address || 'Not provided'}</p>
          </div>
        </div>

        <div className="profile-details sensitive-section">
          <h3>Sensitive Information</h3>
          <div className="security-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>This information is encrypted using AES-256 encryption</span>
          </div>
          
          <div className="detail-item">
            <label>Aadhaar Number (Decrypted)</label>
            {userData?.aadhaar ? (
              <div className="aadhaar-display">
                <p className="aadhaar-number">{userData.aadhaar}</p>
                <p className="aadhaar-masked">Masked: {maskAadhaar(userData.aadhaar)}</p>
                <small className="security-text">
                  ✓ Decrypted securely on server-side
                </small>
              </div>
            ) : (
              <p className="text-muted">Not provided</p>
            )}
          </div>
        </div>

        <div className="profile-meta">
          <div className="meta-item">
            <label>Account Created</label>
            <p>{formatDate(userData?.created_at)}</p>
          </div>
          <div className="meta-item">
            <label>Last Updated</label>
            <p>{formatDate(userData?.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;