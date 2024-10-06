import React from 'react';
import EmailSentView from '../views/EmailSentView';

interface EmailSentControllerProps {
  email: string;
  onReturnToLogin: () => void;
}

const EmailSentController: React.FC<EmailSentControllerProps> = ({ email, onReturnToLogin }) => {
  
  const handleReturnToLogin = () => {
    onReturnToLogin();
  };

  return (
    <EmailSentView email={email} onReturnToLogin={handleReturnToLogin} />
  );
};

export default EmailSentController;
