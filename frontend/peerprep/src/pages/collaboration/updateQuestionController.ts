import { UserQuestion } from "../../context/UserContext";

// Define a function to add a question to a user's profile
export async function addQuestionToUser(userId: string, question: UserQuestion, api: any) {
    try {
        // Send POST request to the backend API endpoint
        const response = await api.post(`/users/${userId}/questions`, { question });
        console.log(`Question added successfully:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error in addQuestionToUser:", error.message || error);
        throw error;
    }
}