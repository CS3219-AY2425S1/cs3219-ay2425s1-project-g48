import React, { useState } from 'react';
import InputBox from '../../components/InputBox';
import LargeButton from '../../components/SubmitButton';
import logo from '/peerprep_logo.png';

interface RegistrationViewProps {
  onSubmit: (username: string, email: string, password: string, confirmPassword: string) => void;
  onLogin: () => void; // New prop to navigate back to login
  errorMessage?: string; // Optional prop for error message
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ onSubmit, onLogin, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null); // General form error
  const [passwordError, setPasswordError] = useState<string | null>(null); // Password-specific error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any field is empty
    if (!username || !email || !password || !confirmPassword) {
      setFormError("All fields are required."); // Set error if any field is empty
      return;
    }

    // Clear the form error if all fields are filled
    setFormError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!"); // Set password mismatch error
      return;
    }

    setPasswordError(null); // Clear password error if they match
    setFormError(null); // Clear form error
    onSubmit(username, email, password, confirmPassword); // Call onSubmit with valid inputs
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="flex justify-center items-center p-2 mb-5">
        <img src={logo} alt="Peerprep Logo" className="w-20 h-20" />
        <span className="text-6xl text-white-800">PeerPrep</span>
      </div>
      <div className="bg-white bg-opacity-10 p-20 rounded-lg backdrop-blur-md text-center w-auto">
        <h2 className="text-white text-2xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-container">
            <InputBox
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-container">
            <InputBox
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="input-container">
            <InputBox
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Display form validation errors */}
          {formError && <p className="text-red-500">{formError}</p>}
          {passwordError && <p className="text-red-500">{passwordError}</p>}
          
          <LargeButton text="Register" onClick={handleSubmit} />
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        <div className="login-link mt-6 text-sm text-gray-300">
          Already have an account? <a href="#" className="text-purple-400 hover:underline" onClick={onLogin}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationView;
