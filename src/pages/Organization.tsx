import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Organization = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect immediately to dashboard
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

export default Organization;
