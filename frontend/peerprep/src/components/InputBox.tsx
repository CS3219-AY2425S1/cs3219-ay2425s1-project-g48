import React from 'react';

interface InputBoxProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
      required
    />
  );
};

export default InputBox;
