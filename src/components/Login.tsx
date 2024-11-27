import { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }
  
    console.log("Email:", email); // Log email
    console.log("Password:", password); // Log password
  
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', { email, password });
      console.log('Login successful:', response.data);
      // Handle successful login (e.g., redirect to dashboard page)
    } catch (error: any) {
      setError('Invalid credentials');
      console.error('Login error:', error.response?.data || error.message); // Log the detailed error
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;