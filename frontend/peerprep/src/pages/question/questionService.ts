export type Question = {
  ID: string;
  Title: string;
  Description: string;
  Categories: string;
  Complexity: string;
  Link: string;
};

export type QuestionRequest = {
  Title: string;
  Description: string;
  Categories: string;
  Complexity: string;
  Link: string;
};

// Do not have to recreate API object here
// This is done on the top level in <App/> component => You can think of useContext as a global state where u can retrieve
// the prop when calling useApiContext(). In this case, the state retrieve is the axios instance.
//
// export const questionService = {
//   getQuestions: async (setAuth: React.Dispatch<React.SetStateAction<boolean>>): Promise<Question[]> => {
//     const api = initApi(setAuth); // Initialize the Axios instance with setAuth
//     try {
//       const response = await api.get("/questions"); // Use the Axios instance to make the GET request
//       return response.data; // Return the data from the response
//     } catch (error: any) {
//       console.error("Error fetching questions:", error);
//       return []; // Return an empty array on error
//     }
//   },
// };
