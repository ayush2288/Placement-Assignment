/**
 * Registration component with encrypted Aadhaar storage
 * Handles user registration with all required fields
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    aadhaar_number: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Passwords don't match";
    }
    
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.aadhaar_number && formData.aadhaar_number.length !== 12) {
      newErrors.aadhaar_number = "Aadhaar number must be 12 digits";
    }
    
    if (formData.aadhaar_number && !/^\d+$/.test(formData.aadhaar_number)) {
      newErrors.aadhaar_number = "Aadhaar number must contain only digits";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/register/', formData);
      
      const { tokens, user } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error("Registration Error Details:", err);
      
      let errorMessage = 'Registration failed. Please try again.';
      let fieldErrors = {};

      if (err.response) {
        // The server responded with a status code (e.g., 400, 500)
        const data = err.response.data;

        if (typeof data === 'object') {
          // It's a validation error (JSON)
          fieldErrors = data;
          
          // Check for specific top-level errors
          if (data.non_field_errors) {
            errorMessage = data.non_field_errors[0];
          } else if (data.detail) {
            errorMessage = data.detail;
          } else {
            // If we have field errors (like "username already exists"), point to them
            errorMessage = "Please correct the errors highlighted below.";
          }
        } else {
          // It's likely a 500 Server Error (HTML response)
          errorMessage = `Server Error (${err.response.status}). Check your Django terminal.`;
        }
      } else if (err.request) {
        // The request was made but no response received (CORS or Server Down)
        errorMessage = "Cannot reach the server. Is the Django backend running?";
      } else {
        errorMessage = err.message;
      }

      // Update state to show the specific message
      setErrors({ ...fieldErrors, general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <h2>Registration Successful!</h2>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Register for Identity Management Service</p>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
                disabled={loading}
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
                disabled={loading}
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              disabled={loading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                disabled={loading}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password_confirm">Confirm Password *</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
              {errors.password_confirm && <span className="error-text">{errors.password_confirm}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="aadhaar_number">Aadhaar Number</label>
            <input
              type="text"
              id="aadhaar"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              placeholder="12-digit Aadhaar number (encrypted)"
              maxLength="12"
              disabled={loading}
            />
            {errors.aadhaar_number && <span className="error-text">{errors.aadhaar_number}</span>}
            <small className="form-hint">Your Aadhaar will be encrypted using AES-256</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+91 XXXXXXXXXX"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;