import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  // State for form inputs - useState creates a variable and a function to update it
  const [email, setEmail] = useState(''); // stores the email value
  const [password, setPassword] = useState(''); // stores the password value
  const [message, setMessage] = useState(''); // stores success/error messages
  const [loading, setLoading] = useState(false); // tracks if request is in progress
  const navigate = useNavigate(); // hook to programmatically navigate between routes

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default form reload behavior
    
    setLoading(true); // show loading state
    setMessage(''); // clear any previous messages

    try {
      // Make API request to backend
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // include cookies for authentication
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // If request failed, display error message
        setMessage(data.error || 'Login failed');
        return;
      }

      // On success, redirect to home page
      window.location.href = '/';
    } catch (error) {
      // Handle network errors or other issues
      setMessage('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="login-container">
      <div className="backWrap" id='return'>
        <button
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
      </div>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        {/* Email input field - controlled component */}
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email} // React controls this value
          onChange={(e) => setEmail(e.target.value)} // update state when user types
          style={{ width: '200px', height: '30px' }}
          required
        />
        <br />
        <br />

        {/* Password input field - controlled component */}
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '200px', height: '30px' }}
          required
        />
        <br />
        <br />

        {/* Submit button - disabled while loading */}
        <div className="backWrap">
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>

      {/* Display error/success messages */}
      {message && <p className="error-message">{message}</p>}

      {/* Link to registration page */}
      <p>
        No account? <a href="/register">Register</a>
      </p>
    </div>
  );
}