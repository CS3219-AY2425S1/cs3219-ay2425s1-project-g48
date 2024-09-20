import React, { useState } from 'react';
import InputBox from '../../components/InputBox';
import LargeButton from '../../components/SubmitButton';
import logo from '/peerprep_logo.png';

interface LoginViewProps {
  onSubmit: (username: string, password: string) => void;
  onCreateAccount: () => void; // New prop for creating an account
  errorMessage?: string; // Optional prop for error message
}

const LoginView: React.FC<LoginViewProps> = ({ onSubmit, onCreateAccount, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="flex justify-center items-center p-2 mb-5">
        <img src={logo} alt="Peerprep Logo" className="w-20 h-20" />
        <span className="text-6xl text-white-800">PeerPrep</span>
      </div>
      <div className="bg-white bg-opacity-10 p-20 rounded-lg backdrop-blur-md text-center w-auto">
        <h2 className="text-white text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-container">
            <InputBox
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-container">
            <InputBox
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="forgot-password text-right">
            <a href="#" className="text-purple-400 hover:underline text-sm">Forgot password?</a>
          </div>
          <LargeButton text="Login" onClick={handleSubmit} />
        </form>
        <div className="signup-link mt-6 text-sm text-gray-300">
          Don’t have an account? <a href="#" className="text-purple-400 hover:underline" onClick={onCreateAccount}>Create account</a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;