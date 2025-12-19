import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Auth = () => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const navigate = useNavigate();
    
    // --- Login State ---
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    
    // --- Register State ---
    const [regData, setRegData] = useState({
        first_name: '', last_name: '', username: '', email: '',
        aadhaar: '', password: '', phone_number: '', address: ''
    });

    // --- Handlers ---
    const handleLoginChange = (e) => setLoginData({...loginData, [e.target.name]: e.target.value});
    const handleRegChange = (e) => setRegData({...regData, [e.target.name]: e.target.value});

    // Login Logic
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('auth/login/', loginData);
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            navigate('/dashboard');
        } catch (err) {
            alert('Login failed. Please check credentials.');
        }
    };

    // Register Logic
    const handleRegSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('auth/register/', regData);
            alert('Registration Successful! Please Sign In.');
            setIsRightPanelActive(false); // Slide back to login
        } catch (err) {
            console.error(err);
            alert('Registration failed. Check your data.');
        }
    };

    return (
        <div className={`container ${isRightPanelActive ? "right-panel-active" : ""}`} id="container">
            
            {/* --- REGISTER FORM (Sign Up) --- */}
            <div className="form-container sign-up-container">
                <form onSubmit={handleRegSubmit}>
                    <h1>Create Account</h1>
                    <span>use your email for registration</span>
                    <input type="text" name="first_name" placeholder="First Name" onChange={handleRegChange} required />
                    <input type="text" name="last_name" placeholder="Last Name" onChange={handleRegChange} required />
                    <input type="text" name="username" placeholder="Username" onChange={handleRegChange} required />
                    <input type="email" name="email" placeholder="Email" onChange={handleRegChange} required />
                    <input type="text" name="aadhaar" placeholder="Aadhaar (Encrypted)" maxLength="12" onChange={handleRegChange} required />
                    <input type="password" name="password" placeholder="Password" onChange={handleRegChange} required />
                    <button type="submit">Sign Up</button>
                </form>
            </div>

            {/* --- LOGIN FORM (Sign In) --- */}
            <div className="form-container sign-in-container">
                <form onSubmit={handleLoginSubmit}>
                    <h1>Sign in</h1>
                    <span>or use your account</span>
                    <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required />
                    <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
                    <a href="#">Forgot your password?</a>
                    <button type="submit">Sign In</button>
                </form>
            </div>

            {/* --- OVERLAY (The Sliding Part) --- */}
            <div className="overlay-container">
                <div className="overlay">
                    {/* Left Panel (Visible when Register is active) */}
                    <div className="overlay-panel overlay-left">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button className="ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
                    </div>

                    {/* Right Panel (Visible when Login is active) */}
                    <div className="overlay-panel overlay-right">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start journey with us</p>
                        <button className="ghost" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;