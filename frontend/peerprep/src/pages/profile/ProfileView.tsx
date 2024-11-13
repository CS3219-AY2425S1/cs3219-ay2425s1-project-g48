import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Container,
  Box,
  Text,
  FormControl,
  FormLabel,
  useToast,
  Checkbox,
} from "@chakra-ui/react";
import { useUserContext } from "../../context/UserContext";
import InputBox from "../../components/InputBox"; // Assuming this is your custom input component
import { useNavigate } from "react-router-dom";
import { useAuthApiContext } from "../../context/ApiContext";

const ProfileView = () => {
  const newUserContext = useUserContext();
  const user = newUserContext.user;
  // const userContext = useContext(UserContext);
  // const user = userContext?.user;
  const toast = useToast();
  const navigate = useNavigate();

  // State management for form inputs
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(true);

  // API instance with auth context
  const api = useAuthApiContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${user?.id}`);
        setUsername(response.data.data.username);
        setEmail(response.data.data.email);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast({
            title: "Error fetching user data.",
            description: error.message || "An error occurred.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user?.id, api, toast]);

  // Handle profile update
  const handleUpdate = async () => {
    try {
      await api.patch(`/users/${user?.id}`, { username, email });
      toast({
        title: "Profile updated.",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      newUserContext.refetch();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error updating profile.",
          description: error.message || "An error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/users/${user?.id}`);
        toast({
          title: "Account deleted.",
          description: "Your account has been deleted successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Handle post-deletion logic (e.g., log out the user or redirect)
        navigate("/login");
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: "Error deleting account.",
            description: error.message || "An error occurred.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a spinner/loading component
  }

  return (
    <Container maxW="60%">
      <Box textAlign="center" py={5}>
        <Text fontSize="2xl" fontWeight="bold">
          Account Settings
        </Text>
        <Avatar size="2xl" name={username} />
      </Box>
      <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="md">
        <FormControl id="username" mb={4}>
          <FormLabel>Username</FormLabel>
          <InputBox
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </FormControl>
        <FormControl id="email" mb={4}>
          <FormLabel>Email</FormLabel>
          <InputBox
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <Button colorScheme="purple" onClick={handleUpdate} mb={2} mr={2}>
          Update
        </Button>
        <Button colorScheme="red" onClick={handleDelete} mb={2} mr={2}>
          Delete Account
        </Button>
      </Box>
    </Container>
  );
};

export default ProfileView;
