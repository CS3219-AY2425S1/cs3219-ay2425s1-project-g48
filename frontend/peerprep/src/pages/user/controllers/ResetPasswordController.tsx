import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../authService';
import ResetPasswordView from '../views/ResetPasswordView';

const ResetPasswordController: React.FC = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();

  const token = searchParams.get('token');
  console.log("token", token)
  
  const handleSubmit = async (newPassword: string) => {
    try {
      if (token === null) {
        setMessage('Invalid token');
        navigate("/login")
        return;
      }

      await resetPassword(newPassword, token);
      setMessage('Password reset successfully');
      navigate("/login")
    } catch (error: any) {
        setMessage(error || "Password is invalid");
    }
  };

  const handleLoginRedirect = () => {
    console.log("Navigating to login page...");
    navigate("/login");
  };

  return (
    <ResetPasswordView 
      onSubmit={handleSubmit} 
      onReturnToLogin={handleLoginRedirect}
      errorMessage={message}
    />
  );
};

export default ResetPasswordController;