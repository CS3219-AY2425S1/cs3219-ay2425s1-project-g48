import React, { useState } from "react";
import InputBox from "../../../components/InputBox";
import LargeButton from "../../../components/SubmitButton";
import { FaArrowLeft } from "react-icons/fa";
import logo from "/peerprep_logo.png";
import { Box, Icon } from "@chakra-ui/react";
import { useButtonWithLoading } from "../../../hooks/ButtonHooks";

interface ResetPasswordViewProps {
  onSubmit: (newPassword: string) => Promise<void>;
  onReturnToLogin: () => void;
  errorMessage?: string;
}

const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onSubmit,
  onReturnToLogin,
  errorMessage,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, onSubmitWithLoading] = useButtonWithLoading(() =>
    onSubmit(password)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    setPasswordError(null);
    onSubmitWithLoading();
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="flex justify-center items-center p-2 mb-5">
        <img src={logo} alt="Peerprep Logo" className="w-20 h-20" />
        <span className="text-6xl text-white">PeerPrep</span>
      </div>
      <div className="bg-white bg-opacity-10 p-10 rounded-lg backdrop-blur-md text-center w-[350px] max-w-full mx-auto">
        <Box
          onClick={onReturnToLogin}
          className="flex items-center justify-start mb-2"
        >
          <Icon
            as={FaArrowLeft}
            color="white"
            _hover={{ color: "purple.500" }}
            className="text-xl mr-2"
          />
        </Box>
        <h2 className="text-white text-2xl font-semibold mb-4">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <InputBox
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isPassword={true}
          />
          <InputBox
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            isPassword={true}
          />
          <LargeButton
            text="Reset Password"
            onClick={handleSubmit}
            isLoading={isLoading}
          />
        </form>

        {/* Display password mismatch error */}
        {passwordError && (
          <div className="text-red-500 mt-4">{passwordError}</div>
        )}

        {/* Display general error message */}
        {errorMessage && (
          <div className="text-red-500 mt-4">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordView;
