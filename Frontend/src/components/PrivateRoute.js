import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading, setUser } = useContext(AuthContext);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchUserFromToken(token);
    } else {
      setAuthLoading(false);
    }
  }, []);

  const fetchUserFromToken = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (!user && !localStorage.getItem('token')) {
    return <Navigate to="/signin" />;
  }

  if (role && role !== user?.role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;