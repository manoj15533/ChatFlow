import { useState } from "react";

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setMessage("Creating account...");

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          onRegisterSuccess();
        }, 1000);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Cannot connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo">
          <span>💬</span>
        </div>

        <div className="login-header">
          <h1>Create account</h1>
          <p>Join your team and start chatting</p>
        </div>

        <form
  onSubmit={handleRegister}
  className="login-form"
  autoComplete="off"
>

          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <div className="input-wrapper">
              <span className="input-icon">👤</span>

              <input
  id="name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter your name"
  autoComplete="off"
  required
/>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">
              Email address
            </label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
  id="register-email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  autoComplete="off"
  required
/>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
  id="register-password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Create a password"
  autoComplete="new-password"
  required
/>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
  id="confirm-password"
  type="password"
  value={confirmPassword}
  onChange={(e) =>
    setConfirmPassword(e.target.value)
  }
  placeholder="Confirm your password"
  autoComplete="new-password"
  required
/>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {message && (
          <div
            className={`login-message ${
              message.includes("successfully")
                ? "success"
                : ""
            }`}
          >
            {message}
          </div>
        )}

        <div className="login-footer">
          <p>
            Already have an account?{" "}
            <span onClick={onBackToLogin}>
              Login
            </span>
          </p>
        </div>

      </div>

      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>
    </div>
  );
}

export default Register;