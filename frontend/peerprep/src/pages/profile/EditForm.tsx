// import React, { useState } from "react";
// import { FormControl, FormLabel } from "@chakra-ui/react";
// import InputBox from "../../components/InputBox";

// const EditForm = ({ id, value, formState, setFormState }) => {
//   const [input, setInput] = useState(value);

//   const handleFormState = (input: string) => {
//     setFormState({
//       ...formState,
//       id: input,
//     });
//   };
//   return (
//     <FormControl id="username" mb={4}>
//       <FormLabel>Username</FormLabel>
//       <InputBox
//         value={username}
//         onChange={(e) => handleFormState(e.target.value)}
//         placeholder="Enter your username"
//       />
//     </FormControl>
//   );
// };

// export default EditForm;
