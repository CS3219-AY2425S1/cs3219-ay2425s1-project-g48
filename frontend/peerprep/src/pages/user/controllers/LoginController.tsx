import React from "react";
import { useNavigate } from 'react-router-dom';
import { login, UserCredentials } from "../authService";
import LoginView from "../views/LoginView";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosInstance } from "axios";

interface LoginControllerProps {
  api : AxiosInstance
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginController: React.FC<LoginControllerProps> = ({api, setAuth}) => {
  //const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate(); 

  const handleLogin = async (email: string, password: string) => {
    const credentials: UserCredentials = { email, password };
    try {
      const token = await login(api, credentials);
      toast.success("Logged in successfully!"); 
      console.log("Logged in successfully! Token:", token);
      setAuth(true)
      setTimeout(() => {
        navigate("/questions");
      }, 1000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Login failed: Invalid email or password.");
      } else {
        toast.error("Login failed: Invalid email or password.");
      }
    }
  };

  const handleCreateAccount = () => {
    console.log("Create account clicked");
    navigate("/register");
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password Clicked");
    // navigate("/forget-password");
  };

  return (
    <>
    <ToastContainer /> 
    <LoginView
      onSubmit={handleLogin}
      onCreateAccount={handleCreateAccount}
      onForgotPassword={handleForgotPassword}
    />
    </>
  );
};

export default LoginController;