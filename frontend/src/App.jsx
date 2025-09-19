import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Signup from "./pages/signup";
import Login from "./pages/login";
import useAuthStore from "./store/authStore";
import OAuth2Callback from "./pages/OAuth2Callback";

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
