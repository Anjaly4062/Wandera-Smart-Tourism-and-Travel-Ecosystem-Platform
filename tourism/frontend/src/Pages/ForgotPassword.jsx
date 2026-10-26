import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/Api";
import "../styles/Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");
        setMessage("");

        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setError("Please enter your registered email address.");
            return;
        }

        // Basic client-side email format regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("forgot-password/", { email: cleanEmail });
            setMessage(
                response.data?.message ||
                "If an account with that email exists, we have sent a password reset link to it. Please check your inbox and spam folder."
            );
            setEmailSent(true);
        } catch (err) {
            console.error("Forgot password error:", err);
            const errMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to process request. Please check your connection and try again.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <Link to="/login" className="back-home-link">
                    ← Back to Login
                </Link>

                <h1>Forgot Password</h1>
                <p>
                    Enter your registered email address and we'll send you a secure link to reset your password.
                </p>

                {error && (
                    <div className="auth-alert auth-alert-error">
                        <span className="auth-alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="auth-alert auth-alert-success">
                        <span className="auth-alert-icon">✓</span>
                        <span>{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Registered Email Address"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                        }}
                        disabled={loading}
                        autoFocus
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Sending Reset Link..." : "Send Reset Link"}
                    </button>
                </form>

                {emailSent && (
                    <p style={{ marginTop: "16px", fontSize: "12px", color: "#cbd5e1" }}>
                        Didn't receive the email? Check your spam folder or try again in 1 minute.
                    </p>
                )}

                <p className="register-text">
                    Remember your password?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
