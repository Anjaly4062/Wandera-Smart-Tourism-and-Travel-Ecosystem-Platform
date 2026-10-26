import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../Services/Api";
import "../styles/Login.css";

export default function ResetPassword() {
    const { uid: paramUid, token: paramToken } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = paramUid || searchParams.get("uid") || "";
    const token = paramToken || searchParams.get("token") || "";

    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Verify token validity on initial mount
    useEffect(() => {
        if (!uid || !token) {
            setVerifying(false);
            setTokenValid(false);
            setError("Reset link is missing required parameters.");
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await api.post("verify-reset-token/", { uid, token });
                if (response.data?.valid) {
                    setTokenValid(true);
                    if (response.data.email) {
                        setUserEmail(response.data.email);
                    }
                } else {
                    setTokenValid(false);
                    setError(response.data?.error || "This password reset link is invalid or has expired.");
                }
            } catch (err) {
                console.error("Token verification error:", err);
                setTokenValid(false);
                setError(
                    err.response?.data?.error ||
                    "This password reset link is invalid or has expired. Please request a new link."
                );
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [uid, token]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");

        if (!newPassword || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match. Please ensure both fields are identical.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("reset-password/", {
                uid,
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            setIsSuccess(true);
            setSuccessMessage(
                response.data?.message ||
                "Your password has been reset successfully! Redirecting you to login..."
            );

            // Automatically redirect to login after 3 seconds
            setTimeout(() => {
                navigate("/login", {
                    state: { message: "Password reset successful. Please login with your new password." }
                });
            }, 3000);
        } catch (err) {
            console.error("Password reset error:", err);
            const errMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to reset password. Please verify requirements and try again.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: "400px" }}>
                <Link to="/login" className="back-home-link">
                    ← Back to Login
                </Link>

                <h1>Reset Password</h1>

                {/* State 1: Verifying Token */}
                {verifying && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#e5e5e5" }}>
                        <div style={{ fontSize: "28px", marginBottom: "12px" }}>⏳</div>
                        <p style={{ margin: 0, fontSize: "14px" }}>Verifying your reset link...</p>
                    </div>
                )}

                {/* State 2: Invalid or Expired Token */}
                {!verifying && !tokenValid && (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div className="auth-alert auth-alert-error" style={{ marginBottom: "20px" }}>
                            <span className="auth-alert-icon">⚠️</span>
                            <span>{error || "This password reset link is invalid or has expired."}</span>
                        </div>

                        <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "20px" }}>
                            Password reset links are single-use and expire after 1 hour for your security.
                        </p>

                        <Link
                            to="/forgot-password"
                            style={{
                                display: "inline-block",
                                width: "100%",
                                padding: "12px",
                                background: "#55d6be",
                                color: "#063b36",
                                borderRadius: "25px",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "14px",
                                boxSizing: "border-box"
                            }}
                        >
                            Request a New Reset Link
                        </Link>
                    </div>
                )}

                {/* State 3: Successful Password Reset */}
                {!verifying && tokenValid && isSuccess && (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div className="auth-alert auth-alert-success" style={{ marginBottom: "20px" }}>
                            <span className="auth-alert-icon">✓</span>
                            <span>{successMessage}</span>
                        </div>

                        <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "20px" }}>
                            You will be automatically redirected to the login page in a few seconds.
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                width: "100%",
                                padding: "12px",
                                background: "#55d6be",
                                color: "#063b36",
                                border: "none",
                                borderRadius: "25px",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            Go to Login Now
                        </button>
                    </div>
                )}

                {/* State 4: Valid Token, Ready to Reset */}
                {!verifying && tokenValid && !isSuccess && (
                    <>
                        <p>
                            {userEmail
                                ? `Create a new, strong password for ${userEmail}.`
                                : "Create a new, strong password for your Wandera account."}
                        </p>

                        {error && (
                            <div className="auth-alert auth-alert-error">
                                <span className="auth-alert-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* New Password */}
                            <div className="password-input-wrapper">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password (min. 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    title={showNewPassword ? "Hide password" : "Show password"}
                                    tabIndex="-1"
                                >
                                    {showNewPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="password-input-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                    tabIndex="-1"
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            <div className="password-guidelines">
                                <div className="password-guidelines-title">Password Requirements:</div>
                                <ul>
                                    <li>Must be at least 8 characters long</li>
                                    <li>Cannot be entirely numeric or overly common</li>
                                    <li>Both passwords must match exactly</li>
                                </ul>
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? "Resetting Password..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
