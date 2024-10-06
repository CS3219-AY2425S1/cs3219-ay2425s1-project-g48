import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { Button, Avatar } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";

import { UserContext } from "../../context/UserContext";
import Dropdown from "./Dropdown";

const DashboardView = () => {
  const difficulties: string[] = ["Easy", "Medium", "Hard"];
  const services: string[] = ["View Questions", "Let's Match"];
  const navigate = useNavigate();

  const userContext = useContext(UserContext);
  const user = userContext?.user;

  return (
    <div className="p-10 min-w-full h-screen">
      <div className="grid grid-cols-2 h-1/3">
        <div className="grid grid-cols-3 min-w-full">
          <div className="col-span-1 flex justify-center items-center">
            <Avatar size="2xl" src="" />
          </div>
          <div className="col-span-2 text-[50px] content-center">
            Welcome Back, {user?.username || "User"}
          </div>
        </div>
        <div className="border-2 rounded-3xl m-10 p-6 grid grid-cols-3 content-center">
          <div className="text-bold text-[40px] col-span-2">
            12/20 Questions
          </div>
          <div className="flex items-center">
            <Button
              w="60%"
              h="12"
              bgColor="purple.500"
              color="white"
              _hover={{ bgColor: "purple.600" }}
              rounded="lg"
              onClick={() => {
                navigate("/questions");
              }}
            >
              View
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="flex justify-end">
          <Dropdown />
        </div>
        <div className="flex flex-col space-y-2 items-center">
          {difficulties.map((value, ind) => (
            <Button
              key={ind}
              w="60%"
              h="12"
              bgColor="purple.500"
              color="white"
              _hover={{ bgColor: "purple.600" }}
            >
              {value}
            </Button>
          ))}
        </div>
        <div className="flex flex-col space-y-2">
          {services.map((value, ind) => (
            <Button
              key={ind}
              w="60%"
              h="12"
              bgColor="purple.500"
              color="white"
              _hover={{ bgColor: "purple.600" }}
              rightIcon={<FaArrowRight />}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
