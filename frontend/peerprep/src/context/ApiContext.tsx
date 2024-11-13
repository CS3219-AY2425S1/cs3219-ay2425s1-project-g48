import { createContext, useContext } from "react";
import { AxiosInstance, AxiosResponse } from "axios";

// Create Auth API context
export const AuthApiContext = createContext<AxiosInstance | null>(null);
export const QuesApiContext = createContext<AxiosInstance | null>(null);
export const ApiContext = createContext<AxiosInstance | null>(null); // Define context type here

export type GetRequest = () => AxiosResponse<any>;
export type PostRequest = (data: any) => Promise<void>;

// Custom hook for Auth API context
export const useAuthApiContext = (): AxiosInstance => {
  const context = useContext(AuthApiContext);

  if (context === null) {
    throw new Error("useAuthApiContext must be used within an AuthApiProvider");
  }

  return context;
};

export const useQuesApiContext = (): AxiosInstance => {
  const context = useContext(QuesApiContext);

  if (context === null) {
    throw new Error("useQuesApiContext must be used within an QuesApiProvider");
  }

  return context;
};

// Custom hook to use the context
export const useApiContext = (): AxiosInstance => {
  const context = useContext(ApiContext);

  if (context === null) {
    throw new Error("useApi must be used within an ApiProvider");
  }

  return context;
};
