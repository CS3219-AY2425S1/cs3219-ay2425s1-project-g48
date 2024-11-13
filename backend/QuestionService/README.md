# Question Service Guide

## Question service start up guide

1. Rename the `.env.example` file to `.env` file.
2. To use the db locally, changed the `ENV` variable to "DEV".
3. To use the cloud db, create a MongoDB Atlas Cluster and obtain the connection string.
4. Add the connection string to the `.env` file under the variable `MONGODB_CLOUD_URI`.
5. Ensure you are in the `QuestionService` directory, then install project dependencies with `go mod download`.
6. Start the Question Service with `go run main.go`.

## Question Service API Guide

### Create Question

- This endpoint allows adding a new user to the database (i.e., user registration).

- HTTP Method: `POST`

- Endpoint: http://localhost:3001/questions

- Body

  - Required: `username` (string), `email` (string), `password` (string)

    ```json
    {
      "title": "Find sum of array",
      "description": "Sum all elements in array of size N",
      "categories": "Arrays",
      "complexity": "Easy",
      "link": "https://leetcode.com/problems/running-sum-of-1d-array/description/"
    }
    ```

- Responses:

  | Response Code               | Explanation                                           |
  | --------------------------- | ----------------------------------------------------- |
  | 201 (Created)               | User created successfully, created user data returned |
  | 400 (Bad Request)           | Missing fields                                        |
  | 409 (Conflict)              | Duplicated question title already in database         |
  | 500 (Internal Server Error) | Database or server error                              |

### Get All Questions

- This endpoint allows retrieval of all questions data from the database.
- HTTP Method: `GET`
- Endpoint: http://localhost:3002/questions
- Headers

  - Required: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

- Responses:

  | Response Code               | Explanation                                      |
  | --------------------------- | ------------------------------------------------ |
  | 200 (OK)                    | Success, all user data returned                  |
  | 401 (Unauthorized)          | Access denied due to missing/invalid/expired JWT |
  | 500 (Internal Server Error) | Database or server error                         |

### Update Question

- This endpoint allows updating a question using the question ID.

- HTTP Method: `PUT`

- Endpoint: http://localhost:3002/questions

- Body

  - At least one of the question fields is required:

    ```json
    {
      "id": "",
      "title": "Find sum of array",
      "description": "Sum all elements in array of size N",
      "categories": "Arrays",
      "complexity": "Easy",
      "link": "https://leetcode.com/problems/running-sum-of-1d-array/description/"
    }
    ```

- Headers

  - Required: `Authorization: Bearer <JWT_ACCESS_TOKEN>`

  - Responses:

  | Response Code               | Explanation                                           |
  | --------------------------- | ----------------------------------------------------- |
  | 200 (OK)                    | User updated successfully, updated user data returned |
  | 400 (Bad Request)           | Missing fields                                        |
  | 401 (Unauthorized)          | Access denied due to missing/invalid/expired JWT      |
  | 500 (Internal Server Error) | Database or server error                              |

### Delete Question

- This endpoint allows deletion of a user and their related data from the database using the user's ID.
- HTTP Method: `DELETE`
- Endpoint: http://localhost:3002/questions?id={questionId}
- Parameters

  - Required: `question` path query parameter

- Headers

  - Required: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
  - Responses:

  | Response Code               | Explanation                                      |
  | --------------------------- | ------------------------------------------------ |
  | 200 (OK)                    | Question deleted successfully                    |
  | 401 (Unauthorized)          | Access denied due to missing/invalid/expired JWT |
  | 404 (Not Found)             | Question with the specified ID not found         |
  | 500 (Internal Server Error) | Database or server error                         |
