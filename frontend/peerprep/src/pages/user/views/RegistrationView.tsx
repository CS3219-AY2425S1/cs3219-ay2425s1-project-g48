import React, { useState } from "react";
import InputBox from "../../../components/InputBox";
import LargeButton from "../../../components/SubmitButton";
import logo from "/peerprep_logo.png";
import { useButtonWithLoading } from "../../../hooks/ButtonHooks";
import { Checkbox, Text } from "@chakra-ui/react";

interface RegistrationViewProps {
  onSubmit: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    isAdmin: boolean // Include isAdmin in the parameters
  ) => Promise<void>;
  onLogin: () => void; // New prop to navigate back to login
}

const RegistrationView: React.FC<RegistrationViewProps> = ({
  onSubmit,
  onLogin,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Manage isAdmin state

  const [formError, setFormError] = useState<string | null>(null); // General form error
  const [passwordError, setPasswordError] = useState<string | null>(null); // Password-specific error

  const [isLoading, submitFormWithLoading] = useButtonWithLoading(() =>
    onSubmit(username, email, password, confirmPassword, isAdmin) // Pass isAdmin to onSubmit
  );

  const checkIsValidForm = (): boolean => {
    // Check if any field is empty
    if (!username || !email || !password || !confirmPassword) {
      setFormError("All fields are required."); // Set error if any field is empty
      return false;
    }

    // Clear the form error if all fields are filled
    setFormError(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!"); // Set password mismatch error
      return false;
    }

    setPasswordError(null); // Clear password error if they match
    setFormError(null); // Clear form error
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIsValidForm()) {
      return;
    }
    submitFormWithLoading();
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="flex justify-center items-center p-2 mb-5">
        <img src={logo} alt="Peerprep Logo" className="w-20 h-20" />
        <span className="text-6xl text-white">PeerPrep</span>
      </div>
      <div className="bg-white bg-opacity-10 p-20 rounded-lg backdrop-blur-md text-center w-[450px] max-w-full mx-auto">
        <h2 className="text-white text-2xl font-semibold mb-4">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="input-container">
            <InputBox
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-container">
            <InputBox
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <InputBox
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isPassword={true} // Enable password toggle for the "Password" field
            />
          </div>
          <div className="input-container">
            <InputBox
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isPassword={true} // Enable password toggle for the "Confirm Password" field
            />
          </div>

          {/* Checkbox for isAdmin */}
          <div className="flex items-center">
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)} // Update isAdmin state
              className="mr-2"
            />
            <Text color={"white"}>Admin</Text>
          </div>

          {/* Display form validation errors */}
          {formError && <p className="text-red-500">{formError}</p>}
          {passwordError && <p className="text-red-500">{passwordError}</p>}

          <LargeButton
            text="Register"
            onClick={handleSubmit}
            isLoading={isLoading}
          />
        </form>
        <div className="login-link mt-6 text-sm text-gray-300">
          Already have an account?{" "}
          <a
            href="#"
            className="text-purple-400 hover:underline"
            onClick={onLogin}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationView;