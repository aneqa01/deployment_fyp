import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(''); // State to store email for forgot/reset password flow
  const [role, setRole]=useState('');
  // Retrieve token and user on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      const userID = decoded.userId;
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      axios
        .get(`http://localhost:8085/api/user/${userID}`)
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Function for user login
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8085/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      setLoading(false);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data?.msg || 'Login failed');
      setLoading(false);
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  // Function to update email (used in Forgot Password flow)
  const updateEmail = (newEmail) => {
    setEmail(newEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        email, // Provide the email to all components
        login,
        logout,
        updateEmail, // Expose the updateEmail function
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
