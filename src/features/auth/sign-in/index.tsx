import { useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { ForgotPasswordForm } from "../forgot-password/components/forgot-password-form";
import { FloatingParticles } from "./components/floating-particles";
import { LoginForm } from "./components/user-auth-form";
import DevstreeLogo from "@/assets/devstree-squre-white-text-logo.svg";

// ✅ your component

const AdminLogin = () => {
  const { isAuthenticated } = useAuthStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (typeof window !== "undefined" && isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="dark relative flex min-h-screen bg-gray-900 text-white font-sans">
      {/* Full-screen background elements */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 50%, #E80339, rgba(232, 3, 57, 0) 30%), radial-gradient(circle at 85% 40%, #FFFFFF, rgba(255, 255, 255, 0) 40%)",
          opacity: 0.15,
        }}
      />
      <FloatingParticles />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Left visual panel */}
      <div className="relative hidden w-1/2 lg:flex">
        <div className="relative z-10 m-auto p-10 ">
          <div className="mb-8 ">
            <img
              src={DevstreeLogo}
              alt="Project Management Logo"
              className="object-contain h-16 w-fit"
            />
          </div>
          <h1 className="mb-5 bg-gradient-to-r from-[#E80339] to-white bg-clip-text text-4xl font-bold text-transparent">
            Project Management
          </h1>
          <p className="mb-8 text-md opacity-90">
            Secure access to your Management system with advanced security
            features
          </p>
        </div>
      </div>

      {/* Right login / forgot password form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 space-y-3 text-center">
              <div className="mx-auto flex h-16 bg-gradient-primary w-16 items-center justify-center rounded-full bg-gra shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">
                {showForgotPassword ? "Forgot Password" : "Welcome Back"}
              </h1>
              <p className="text-gray-400">
                {showForgotPassword
                  ? "Enter your email to reset your password"
                  : "Please sign in to your system account"}
              </p>
            </div>

            {showForgotPassword ? (
              <ForgotPasswordForm
                onBackToLogin={() => setShowForgotPassword(false)}
              />
            ) : (
              <>
                <LoginForm />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-[#fff] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
