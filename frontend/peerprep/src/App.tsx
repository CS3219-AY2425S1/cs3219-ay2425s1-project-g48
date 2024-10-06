import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import LoginController from "./pages/user/controllers/LoginController";
import QuestionController from "./pages/question/QuestionController";
import RegistrationController from "./pages/user/controllers/RegistrationController";
import ForgetPasswordController from "./pages/user/controllers/ForgetPasswordController";
import ResetPasswordController from "./pages/user/controllers/ResetPasswordController";
import PrivateRoutes from "./utils/PrivateRoutes";
import DashboardView from "./pages/dashboard/DashboardView";
import ProfileView from "./pages/profile/ProfileView";
import { initApi, authApi, questionApi } from "./utils/api";

const App: React.FC = () => {
  const queryClient = new QueryClient();

  const [isAuth, setAuth] = React.useState(
    localStorage.getItem("token") ? true : false
  );

  const api = initApi(setAuth);
  const auth = authApi(setAuth);
  const ques = questionApi(setAuth);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            element={
              <PrivateRoutes
                isAuth={isAuth}
                api={api}
                setAuth={setAuth}
                authApi={auth}
                quesApi={ques}
              />
            }
          >
            {/* Put axios api instance into a context */}
            <Route path="/questions" element={<QuestionController />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<LoginController api={auth} setAuth={setAuth} />}
          />
          <Route
            path="/register"
            element={<RegistrationController api={auth} setAuth={setAuth} />}
          />
          {/* <Route
            path="/forget-password"
            element={<ForgetPasswordController />}
          />
          <Route path="/reset-password" element={<ResetPasswordController />} /> */}
          ``
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
