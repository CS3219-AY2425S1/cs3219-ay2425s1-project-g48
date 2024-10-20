import { createContext, useContext } from "react";
import axios, { AxiosInstance } from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery, QueryObserverResult } from "@tanstack/react-query";

export type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string; // You can use Date if it's parsed as a date
  // questions_done: number[] | null; (TODO)
};

export type UserContextType = {
  user: User;
  status: "pending" | "error" | "success";
  refetch: () => Promise<QueryObserverResult<any, Error>>; // Refetch function
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  children,
  isAuth,
  authApi,
}: {
  children: React.ReactNode;
  isAuth: boolean;
  authApi: AxiosInstance;
}) => {
  const navigate = useNavigate();

  const fetchUserData = async () => {
    // setLoading(true);
    // setStatus("pending"); // Set status to pending while fetching
    try {
      const userId = localStorage.getItem("userId");

      // if userId not found in localStorage, return to login
      if (userId == null) {
        navigate("/login");
        return;
      }

      const response = await authApi.get(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "An error occurred while fetching user data"
        );
      } else {
        console.error("Unknown error: ", error);
        throw new Error("An unexpected error occurred");
      }
    }
  };

  const {
    data: userData,
    status: userStatus,
    refetch: refetchUserData,
  } = useQuery<User>({
    queryKey: ["user", isAuth],
    queryFn: fetchUserData,
    initialData: {
      id: "",
      username: "",
      email: "",
      isAdmin: false,
      createdAt: "",
    },
  });

  const userContext: UserContextType = {
    user: userData,
    status: userStatus,
    refetch: refetchUserData,
  };

  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUserContext must be used within a UserProvider");
  }

  return context;
};
