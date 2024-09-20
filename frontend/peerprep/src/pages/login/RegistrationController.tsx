import React, { useState } from 'react';
import RegistrationView from './RegistrationView';
import { register, UserCredentials } from './authService';

const RegistrationController: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const handleRegistration = async (username: string, email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const userCredentials: UserCredentials = {
      username,
      email,
      password
    };

    try {
      const response = await register(userCredentials);
      console.log("Registration successful:", response);
      // Redirect to login or dashboard upon success
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage("Registration failed: " + error.message);
      } else {
        setErrorMessage("Registration failed: Unknown error");
      }
    }
  };

  const handleLoginRedirect = () => {
    // Logic to navigate to the LoginView, could be using react-router
    console.log("Navigating to login page...");
  };

  return (
    <RegistrationView 
      onSubmit={handleRegistration} 
      onLogin={handleLoginRedirect} 
      errorMessage={errorMessage} 
    />
  );
};

export default RegistrationController;
