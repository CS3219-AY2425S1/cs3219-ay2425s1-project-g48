import React, { useEffect, useState } from "react";
import QuestionView from "./QuestionView";
import { Question } from "./questionService";
import { useApiContext } from "../../context/ApiContext";

const QuestionController: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);

  const api = useApiContext();

  useEffect(() => {
    api
      .get("/questions")
      .then((response) => {
        // use the api instance to make post request using axios post method
        if (response.status === 200) {
          setQuestions(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [api]);

  const handleDeleteQuestion = (title: string) => {
    console.log("Attempting to delete question with title:", title); // Debugging statement
  
    if (title === undefined) {
      console.error("No valid TITLE provided for deletion.");
      return; // Early exit if TITLE is undefined
    }
  
    // Proceed with deleting from state
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.Title !== title));
  
    // Call the API to delete the question on the backend
    api
      .delete(`/questions/${title}`)
      .then((response) => {
        console.log(`Question with title ${title} deleted successfully.`);
      })
      .catch((error) => {
        console.error(`Error deleting question with title ${title}:`, error);
      });
  };
  
  return (
    <QuestionView
      questions={questions}
      onDeleteQuestion={handleDeleteQuestion} // Pass delete handler as prop
    />
  );
};

export default QuestionController;
