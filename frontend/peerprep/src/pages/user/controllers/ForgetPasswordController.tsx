import React, { useState } from 'react';
import { sendResetLink } from '../authService';
import ForgotPasswordView from '../views/ForgetPasswordView';
import { useNavigate } from 'react-router-dom';
import EmailSentController from './EmaiSentController';

const ForgetPasswordController: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('') 
  const navigate = useNavigate();

  const handleSendResetLink = async (email: string) => {
    if (email == "") {
        setErrorMessage("Please fill in your email");
        return;
    }

    try {
      await sendResetLink(email);
      setEmailSent(true);
      setEmail(email);
    } catch (error: any) {
        setErrorMessage(error || "Email is invalid");
    }

  };

  const handleReturnToLogin = () => {
    console.log("Return to login...")
    navigate('/login')
  }

  return (
    <>
      {emailSent ? (
        <EmailSentController email={email} onReturnToLogin={handleReturnToLogin} />
      ) : (
        <ForgotPasswordView onSubmit={handleSendResetLink} onReturnToLogin={handleReturnToLogin} errorMessage={errorMessage} />
      )}
    </>
  );

};

export default ForgetPasswordController;
