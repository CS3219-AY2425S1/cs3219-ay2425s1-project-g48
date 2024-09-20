export interface UserCredentials {
    username: string;
    password: string;
  }
  
  export const login = async (credentials: UserCredentials): Promise<string> => {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
  
      const data = await response.json();
      return data.token;
    } catch (error) {
      return Promise.reject("error"); // TO-DO
    }
  };