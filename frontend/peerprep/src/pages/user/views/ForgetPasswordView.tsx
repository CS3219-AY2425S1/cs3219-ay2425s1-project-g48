import React, { useState } from "react";
import InputBox from "../../../components/InputBox";
import LargeButton from "../../../components/SubmitButton";
import { FaArrowLeft } from "react-icons/fa";
import logo from "/peerprep_logo.png";
import { Box, Icon } from "@chakra-ui/react";
import { useButtonWithLoading } from "../../../hooks/ButtonHooks";

interface ForgotPasswordViewProps {
  onSubmit: (email: string) => Promise<void>;
  onReturnToLogin: () => void;
  errorMessage?: string;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onSubmit,
  onReturnToLogin,
  errorMessage,
}) => {
  const [email, setEmail] = useState("");

  const [isLoading, onSubmitWithLoading] = useButtonWithLoading(() =>
    onSubmit(email)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitWithLoading();
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#1D004E] to-[#141A67]">
      <div className="flex justify-between items-center p-2 mb-8">
        <img src={logo} alt="Peerprep Logo" className="w-20 h-20" />
        <span className="text-6xl text-white ml-4">PeerPrep</span>
      </div>
      <div className="bg-white bg-opacity-10 p-8 md:p-10 rounded-lg backdrop-blur-md text-center w-[400px] max-w-full mx-auto">
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
        <h2 className="text-white text-2xl font-semibold">Forgot Password?</h2>
        <p className="text-white mt-2 mb-5 text-sm">
          We will send a password reset link to your email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-8">
          <InputBox
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <LargeButton
            text="Send Reset Link"
            onClick={handleSubmit}
            isLoading={isLoading}
          />
        </form>
        {errorMessage && (
          <div className="text-red-500 mt-4 text-sm font-semibold mb-2">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordView;
