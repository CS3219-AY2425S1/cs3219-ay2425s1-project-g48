import React from 'react';

interface LargeButtonProps {
  text: string;
  onClick: (e: React.FormEvent) => void;
}

const LargeButton: React.FC<LargeButtonProps> = ({ text, onClick }) => {
  return (
    <button
      type="submit"
      className="w-full py-3 rounded-full bg-purple-500 text-white text-lg font-semibold transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default LargeButton;