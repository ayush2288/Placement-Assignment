import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('profile/');
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // If error (e.g. token expired), logout
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) return <div style={{color: '#333'}}>Loading...</div>;

  return (
    // Reusing the 'container' class from your Auth CSS for consistent look
    <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '40px', alignItems: 'center', height: 'auto', minHeight: '600px' }}>
      
      <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome, {user?.first_name}!</h1>
      <p style={{ marginBottom: '30px' }}>Secure Identity Dashboard</p>

      {/* Profile Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '500px', 
        textAlign: 'left', 
        background: '#f8f9fa', 
        padding: '25px', 
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Full Name</label>
          <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{user?.first_name} {user?.last_name}</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Email</label>
          <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{user?.email}</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Username</label>
          <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>{user?.username}</div>
        </div>

        {/* Secure Section */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e0f2f1', 
          border: '1px solid #80cbc4', 
          borderRadius: '8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>🔒</span>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#00695c', textTransform: 'uppercase', marginBottom: 0 }}>
              Decrypted Aadhaar ID
            </label>
          </div>
          
          <div style={{ 
            fontSize: '20px', 
            color: '#004d40', 
            fontWeight: 'bold', 
            letterSpacing: '2px',
            fontFamily: 'monospace' 
          }}>
            {user?.aadhaar || "Not Provided"}
          </div>
          <div style={{ fontSize: '11px', color: '#00796b', marginTop: '5px' }}>
            * This data was encrypted in DB and decrypted just for you.
          </div>
        </div>

      </div>

      <button 
        onClick={handleLogout} 
        style={{ 
          marginTop: '30px', 
          backgroundColor: '#333', 
          borderColor: '#333',
          padding: '12px 30px'
        }}
      >
        Logout
      </button>

    </div>
  );
};

export default Dashboard;