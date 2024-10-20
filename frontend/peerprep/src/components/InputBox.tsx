import { Icon } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputBoxProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean; // Optional prop to determine if input is a password
}

const InputBox: React.FC<InputBoxProps> = ({
  placeholder,
  value,
  onChange,
  isPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      <input
        type={isPassword && !showPassword ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      {isPassword && (
        <a
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400"
        >
          <Icon as={showPassword ? FaEye : FaEyeSlash} />
        </a>
      )}
    </div>
  );
};

export default InputBox;
