import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./App.css";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Forgot Password
const [showForgotPassword, setShowForgotPassword] =
    useState(false);

const [forgotEmail, setForgotEmail] = useState("");
const [forgotMessage, setForgotMessage] = useState("");
const [forgotLoading, setForgotLoading] = useState(false);

   // Check if user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // Show Register page
  const [showRegister, setShowRegister] = useState(false);

      if (
        window.location.pathname.startsWith(
            "/reset-password/"
        )
    ) {
        return <ResetPassword />;
    }

    // ==============================
// FORGOT PASSWORD
// ==============================
const handleForgotPassword = async (e) => {
  e.preventDefault();

  setForgotMessage("");
  setForgotLoading(true);

  try {
    const response = await fetch(
      "http://localhost:4000/api/password/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setForgotMessage(
        "Password reset link sent to your email."
      );
    } else {
      setForgotMessage(
        data.message || "Unable to send reset link."
      );
    }
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    setForgotMessage(
      "Cannot connect to server."
    );
  } finally {
    setForgotLoading(false);
  }
};

 
  // ==============================
  // LOGIN
  // ==============================
  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log("Logged in user:", data.user);

        // Move to Chat page
        setIsLoggedIn(true);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to server");
    }
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setEmail("");
    setPassword("");
    setMessage("");
    setIsLoggedIn(false);
  };

  // ==============================
  // SHOW CHAT
  // ==============================
  if (isLoggedIn) {
    return <Chat onLogout={handleLogout} />;
  }

  // ==============================
  // SHOW REGISTER
  // ==============================
  if (showRegister) {
    return (
      <Register
        onRegisterSuccess={() => setShowRegister(false)}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  // ==============================
  // SHOW LOGIN
  // ==============================
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="logo">
          <span>💬</span>
        </div>

        {/* Heading */}
        <div className="login-header">
          <h1>Welcome back</h1>

          <p>
            Login to continue chatting with your team
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email address
            </label>

            <div className="input-wrapper">
              <span className="input-icon">
                ✉
              </span>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">
                🔒
              </span>

              <input
    id="password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter your password"
    autoComplete="new-password"
    required
/>
<button
    type="button"
    className="password-toggle"
    onClick={() =>
        setShowPassword(!showPassword)
    }
>
    {showPassword ? <FiEyeOff /> : <FiEye />}
</button>
            </div>
            <div className="forgot-password-container">
    <button
        type="button"
        className="forgot-password-link"
        onClick={() => {
    setForgotEmail(email);
    setForgotMessage("");
    setShowForgotPassword(true);
}}
    >
        Forgot password?
    </button>
</div>


          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>
        </form>

        {/* Response message */}
        {message && (
          <div
            className={`login-message ${
              message.includes("successful")
                ? "success"
                : ""
            }`}
          >
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <span
              onClick={() => setShowRegister(true)}
            >
              Register
            </span>
          </p>
        </div>

      </div>

            {/* Forgot Password Popup */}
      {showForgotPassword && (
        <div className="forgot-password-overlay">

          <div className="forgot-password-modal">

            <button
              type="button"
              className="forgot-password-close"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail("");
                setForgotMessage("");
              }}
            >
              ×
            </button>

            <div className="forgot-password-icon">
              📧
            </div>

            <h2>Forgot Password?</h2>

            <p>
              Enter your registered email address and
              we'll send you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword}>

              <div className="forgot-password-input-group">

                <label htmlFor="forgot-email">
                  Email address
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />

              </div>

              {forgotMessage && (
                <div className="forgot-password-message">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                className="forgot-password-submit"
                disabled={forgotLoading}
              >
                {forgotLoading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* Background circles */}
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>
    </div>
  );
}

export default App;
