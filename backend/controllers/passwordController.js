const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email",
            });
        }

        // Create a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Token expires in 15 minutes
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

        // Temporarily store reset information
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;

        await user.save();

        // Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"ChatFlow" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "ChatFlow - Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #6c5ce7;">
                        Reset Your ChatFlow Password
                    </h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your ChatFlow password.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <a
                        href="${resetLink}"
                        style="
                            display: inline-block;
                            padding: 12px 24px;
                            background: #6c5ce7;
                            color: white;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: bold;
                        "
                    >
                        Reset Password
                    </a>

                    <p style="margin-top: 20px; color: #777;">
                        This link will expire in 15 minutes.
                    </p>

                    <p style="color: #999; font-size: 12px;">
                        If you did not request a password reset, you can safely
                        ignore this email.
                    </p>
                </div>
            `,
        });

        res.status(200).json({
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            message: "Unable to send password reset email",
        });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: {
                $gt: Date.now(),
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset link",
            });
        }

        // Hash the new password
        const bcrypt = require("bcryptjs");

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        user.password = hashedPassword;

        // Clear the reset token after successful reset
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            message: "Unable to reset password",
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
};