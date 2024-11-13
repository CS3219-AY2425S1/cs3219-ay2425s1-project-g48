import React from 'react';
import LargeButton from '../../../components/SubmitButton';

interface EmailSentViewProps {
  email: string;  // The email to which the reset link was sent
  onReturnToLogin: () => void;  // Function to handle navigation back to login
}

const EmailSentView: React.FC<EmailSentViewProps> = ({ email, onReturnToLogin }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="bg-white bg-opacity-10 p-10 md:p-20 rounded-lg backdrop-blur-md text-center w-[450px] max-w-full mx-auto">
        <h2 className="text-white text-2xl font-semibold mb-5">Email Sent!</h2>
        <p className="text-white mb-5">
          We’ve sent a password reset link to <strong>{email}</strong>. Please check your inbox.
        </p>
        <LargeButton text="Return to Login" onClick={onReturnToLogin} />
      </div>
    </div>
  );
};

export default EmailSentView;