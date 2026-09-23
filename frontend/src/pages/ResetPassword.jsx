import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./ResetPassword.css";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);
    const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [resetSuccessful, setResetSuccessful] = useState(false);

    const token =
        window.location.pathname.split("/").pop();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `http://localhost:4000/api/password/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            setMessage(
    "Password reset successful! You can now login."
);

setPassword("");
setConfirmPassword("");
setResetSuccessful(true);
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">

            <div className="reset-password-card">

                <div className="reset-password-icon">
                    🔐
                </div>

                <h1>Reset Password</h1>

                <p className="reset-password-subtitle">
                    Create a new password for your ChatFlow
                    account.
                </p>

                <form onSubmit={handleResetPassword}>

                    {resetSuccessful ? (
    <div className="reset-success-screen">

        <div className="reset-success-icon">
            ✓
        </div>

        <h2>Password Reset Successful!</h2>

        <p>
            Your password has been changed successfully.
            You can now login with your new password.
        </p>

        <button
            type="button"
            className="reset-login-button"
            onClick={() => {
                window.location.href = "/";
            }}
        >
            Go to Login
        </button>

    </div>
) : (
    <>
        <div className="reset-input-group">

            <label>New Password</label>

            <div className="reset-input-wrapper">

                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    required
                />

                <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() =>
                        setShowPassword(!showPassword)
                    }
                >
                    {showPassword ? (
                        <FiEyeOff />
                    ) : (
                        <FiEye />
                    )}
                </button>

            </div>

        </div>

        <div className="reset-input-group">

            <label>Confirm Password</label>

            <div className="reset-input-wrapper">

                <input
                    type={
                        showConfirmPassword
                            ? "text"
                            : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(
                            e.target.value
                        )
                    }
                    placeholder="Confirm new password"
                    required
                />

                <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() =>
                        setShowConfirmPassword(
                            !showConfirmPassword
                        )
                    }
                >
                    {showConfirmPassword ? (
                        <FiEyeOff />
                    ) : (
                        <FiEye />
                    )}
                </button>

            </div>

        </div>

        {error && (
            <div className="reset-error">
                {error}
            </div>
        )}

        <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
        >
            {loading
                ? "Resetting..."
                : "Reset Password"}
        </button>
    </>
)}

                </form>

            </div>

        </div>
    );
}

export default ResetPassword;