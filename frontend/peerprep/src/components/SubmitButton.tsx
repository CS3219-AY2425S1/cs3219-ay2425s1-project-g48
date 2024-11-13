import React from "react";
import { Spinner } from "@chakra-ui/react";

interface LargeButtonProps {
  text: string;
  onClick: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const LargeButton: React.FC<LargeButtonProps> = ({
  text,
  onClick,
  isLoading,
}) => {
  return (
    <button
      type="submit"
      className="w-full py-3 rounded-full bg-purple-500 text-white text-lg font-semibold transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? <Spinner /> : text}
    </button>
  );
};

export default LargeButton;
