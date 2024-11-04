import { useEffect, useState } from "react";
import { useQuesApiContext } from "../../context/ApiContext";
import { Question } from "../question/questionModel";

const QuestionDisplay = ({ questionId, styles, onFetchQuestion }) => {
  const api = useQuesApiContext();
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questionsById?id=${questionId}`);
      setQuestion(response.data.questions[0]);
      onFetchQuestion(response.data.questions[0]);
      console.log(response.data.questions[0]);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  return question ? (
    <div style={styles.questionSection} className="editor-scrollbar">
      <h2 style={styles.questionTitle}>{question.Title}</h2>

      <div style={styles.questionDetail}>
        <p>
          <strong>Complexity:</strong> {question.Complexity}
        </p>
      </div>

      <h3 style={styles.questionSubheading}>Description:</h3>
      <div
        style={styles.questionDetail}
        dangerouslySetInnerHTML={{ __html: question.Description }}
      />

      <h3 style={styles.questionSubheading}>Categories:</h3>
      <p style={styles.questionDetail}>{question.Categories.join(", ")}</p>

      <a
        href={question.Link}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.leetCodeLink}
      >
        View on LeetCode
      </a>
    </div>
  ) : (
    <div>Loading Question...</div>
  );
};

export default QuestionDisplay;