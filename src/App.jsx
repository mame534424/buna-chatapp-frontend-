import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import Verify from "./pages/VerifyPage";
import ForgotPassword from "./pages/ForgotPassword";
import NewPasswordPage from "./pages/NewPasswordPage";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { WebSocketProvider } from "./context/WebSocketProvider";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <BrowserRouter>
        <Routes>
          {/* ✅ Redirect root to signup */}
          <Route path="/" element={<Navigate to="/signup" replace />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/verify" element={<Verify />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <WebSocketProvider>
                  <Dashboard />
                </WebSocketProvider>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
