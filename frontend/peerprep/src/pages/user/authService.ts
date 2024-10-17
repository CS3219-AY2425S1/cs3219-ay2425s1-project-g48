import { useContext } from "react";
import { UserContext, UserContextType } from "../../context/UserContext";
import { AxiosInstance } from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface UserCredentials {
  username?: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

// export interface LoginTokens {
//   token: string;
//   refreshToken: string;
// }

export interface LoginTokens {
  message: string; // Add this if you want to capture the message from the response
  data: {
    accessToken: string;
    createdAt: string; // If you want to store the creation date
    email: string;
    id: string; // User ID
    isAdmin: boolean;
    username: string;
  };
}

export const login = async (
  api: AxiosInstance,
  credentials: UserCredentials
): Promise<LoginTokens> => {
  try {
    const response = await api.post<LoginTokens>("/auth/login", credentials);
    console.log(response.data);
    // Save tokens in localStorage
    localStorage.setItem("token", response.data.data.accessToken);
    localStorage.setItem("userId", response.data.data.id);
    // localStorage.setItem("refreshToken", response.data.refreshToken);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Promise.reject(error.message || "Login error");
    } else {
      return Promise.reject("Login error");
    }
  }
};

export const register = async (
  api: AxiosInstance,
  credentials: UserCredentials
): Promise<string> => {
  try {
    const response = await api.post("/users", credentials); // Calls the /users route
    return response.data.message; // Assuming backend returns a success message
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Registration error");
  }
};

// export const login = async (credentials: UserCredentials): Promise<{ token: string, refreshToken: string }> => {
//   try {
//     const response = await fetch(`${API_URL}/v1/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: 'include',
//       body: JSON.stringify(credentials),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Invalid email or password");
//     }

//     const data : LoginTokens = await response.json();

//     localStorage.setItem("token", data.token);
//     localStorage.setItem("refreshToken", data.refreshToken);

//     return {
//       token: data.token,
//       refreshToken: data.refreshToken,
//     };

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return Promise.reject(error.message || "Login error");
//     } else {
//       return Promise.reject("Login error");
//     }
//   }
// };

// export const register = async (credentials: UserCredentials): Promise<string> => {
//   try {
//     const response = await fetch("http://localhost:8080/v1/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       credentials: 'include',
//       body: JSON.stringify(credentials),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Registration failed");
//     }

//     const data = await response.json();
//     return data.message;
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return Promise.reject(error.message || "Registration error");
//     } else {
//       return Promise.reject("Registration error");
//     }
//   }
// };

export const sendResetLink = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/v1/email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send reset link");
    }
  } catch (error: any) {
    return Promise.reject(error.message || "Reset link error");
  }
};

export const resetPassword = async (
  newPassword: string,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/v1/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reset password");
    }
  } catch (error: any) {
    return Promise.reject(error.message || "Password reset error");
  }
};
