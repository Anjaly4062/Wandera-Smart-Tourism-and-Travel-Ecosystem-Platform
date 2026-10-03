import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/Api";
import "../styles/Register.css";
import Swal from "sweetalert2";

const PASSWORD_RULES = [
    { id: "length", text: "Password must be at least 8 characters.", test: (val) => (val || "").length >= 8 },
    { id: "uppercase", text: "Password must contain at least one uppercase letter.", test: (val) => /[A-Z]/.test(val || "") },
    { id: "lowercase", text: "Password must contain at least one lowercase letter.", test: (val) => /[a-z]/.test(val || "") },
    { id: "number", text: "Password must contain at least one number.", test: (val) => /[0-9]/.test(val || "") },
    { id: "special", text: "Password must contain at least one special character.", test: (val) => /[^A-Za-z0-9]/.test(val || "") }
];

const validateField = (name, value, allValues, currentRole) => {
    switch (name) {
        case "full_name": {
            const trimmed = (value || "").trim();
            if (!trimmed) {
                return "Full name is required";
            }
            return "";
        }
        case "email": {
            const trimmed = (value || "").trim();
            if (!trimmed) {
                return "Email is required";
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) {
                return "Please enter a valid email address";
            }
            return "";
        }
        case "password": {
            if (!value) {
                return "Password is required";
            }
            const unfulfilled = PASSWORD_RULES.filter(rule => !rule.test(value)).map(r => r.text);
            if (unfulfilled.length > 0) {
                return unfulfilled;
            }
            return "";
        }
        case "confirm_password": {
            if (!value) {
                return "Please confirm your password";
            }
            if (value !== allValues.password) {
                return "Passwords do not match";
            }
            return "";
        }
        case "service_type": {
            if (currentRole === "provider" && !value) {
                return "Please select a Service Type.";
            }
            return "";
        }
        case "business_name": {
            if (currentRole === "provider" && !(value || "").trim()) {
                return "Business Name is required.";
            }
            return "";
        }
        case "license_number": {
            if (currentRole === "provider" && !(value || "").trim()) {
                return "License Number is required.";
            }
            return "";
        }
        case "certificate": {
            if (currentRole === "provider" && !value) {
                return "Please upload your Registration Certificate.";
            }
            return "";
        }
        default:
            return "";
    }
};

function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState("tourist");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        service_type: "",
        business_name: "",
        license_number: "",
        certificate: null
    });

    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedFormData);
        setTouched((prev) => ({
            ...prev,
            [name]: true
        }));

        const fieldError = validateField(name, value, updatedFormData, role);

        // If updating password, revalidate confirm_password as well if touched/entered
        if (name === "password" && (touched.confirm_password || formData.confirm_password)) {
            const confirmError = validateField("confirm_password", formData.confirm_password, updatedFormData, role);
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError,
                confirm_password: confirmError
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({
            ...prev,
            [name]: true
        }));
        const fieldError = validateField(name, value, formData, role);
        setErrors((prev) => ({
            ...prev,
            [name]: fieldError
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0] || null;
        const updatedFormData = {
            ...formData,
            certificate: file
        };
        setFormData(updatedFormData);
        setTouched((prev) => ({
            ...prev,
            certificate: true
        }));
        const certError = validateField("certificate", file, updatedFormData, role);
        setErrors((prev) => ({
            ...prev,
            certificate: certError
        }));
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setRole(newRole);
        // Clear provider errors when switching back to tourist
        if (newRole === "tourist") {
            setErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors.service_type;
                delete nextErrors.business_name;
                delete nextErrors.license_number;
                delete nextErrors.certificate;
                return nextErrors;
            });
        }
    };

    const hasFieldError = (field) => {
        if (!touched[field]) return false;
        const err = errors[field];
        if (Array.isArray(err)) return err.length > 0;
        return Boolean(err);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const relevantFields = role === "provider"
            ? ["full_name", "email", "password", "confirm_password", "service_type", "business_name", "license_number", "certificate"]
            : ["full_name", "email", "password", "confirm_password"];

        const nextTouched = { ...touched };
        const nextErrors = { ...errors };
        let hasAnyError = false;

        relevantFields.forEach((field) => {
            nextTouched[field] = true;
            const err = validateField(field, formData[field], formData, role);
            nextErrors[field] = err;
            if (Array.isArray(err) ? err.length > 0 : Boolean(err)) {
                hasAnyError = true;
            }
        });

        setTouched(nextTouched);
        setErrors(nextErrors);

        if (hasAnyError) {
            return;
        }

        setLoading(true);

        try {
            if (role === "tourist") {
                await api.post("tourist-register/", {
                    full_name: formData.full_name.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                });

                navigate("/");
            } else {
                const providerData = new FormData();
                providerData.append("full_name", formData.full_name.trim());
                providerData.append("email", formData.email.trim());
                providerData.append("password", formData.password);
                providerData.append("service_type", formData.service_type);
                providerData.append("business_name", formData.business_name.trim());
                providerData.append("license_number", formData.license_number.trim());
                providerData.append("certificate", formData.certificate);

                await api.post("provider-register/", providerData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                navigate("/");
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Registration Error",
                text: errMsg,
                confirmButtonColor: "#55d6be"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <Link to="/" className="back-home-link">
                    ← Back to Home
                </Link>

                <h1>
                    Join <span>Wandera</span>
                </h1>

                <p>
                    Explore amazing destinations and create unforgettable journeys
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Full Name */}
                    <div className="field-group">
                        <label className="form-label" htmlFor="full_name">
                            Full Name <span className="required-star">*</span>
                        </label>
                        <input
                            id="full_name"
                            type="text"
                            name="full_name"
                            placeholder="Enter your full name"
                            value={formData.full_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={hasFieldError("full_name") ? "input-error" : ""}
                        />
                        {hasFieldError("full_name") && (
                            <p className="field-error">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="field-group">
                        <label className="form-label" htmlFor="email">
                            Email <span className="required-star">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={hasFieldError("email") ? "input-error" : ""}
                        />
                        {hasFieldError("email") && (
                            <p className="field-error">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="field-group">
                        <label className="form-label" htmlFor="password">
                            Password <span className="required-star">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={hasFieldError("password") ? "input-error" : ""}
                        />
                        {hasFieldError("password") && (
                            typeof errors.password === "string" ? (
                                <p className="field-error">{errors.password}</p>
                            ) : Array.isArray(errors.password) && errors.password.length > 0 ? (
                                <ul className="password-rules-list">
                                    {errors.password.map((rule, idx) => (
                                        <li key={idx}>{rule}</li>
                                    ))}
                                </ul>
                            ) : null
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="field-group">
                        <label className="form-label" htmlFor="confirm_password">
                            Confirm Password <span className="required-star">*</span>
                        </label>
                        <input
                            id="confirm_password"
                            type="password"
                            name="confirm_password"
                            placeholder="Confirm your password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={hasFieldError("confirm_password") ? "input-error" : ""}
                        />
                        {hasFieldError("confirm_password") && (
                            <p className="field-error">{errors.confirm_password}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div className="field-group">
                        <label className="form-label" htmlFor="role">
                            Account Type <span className="required-star">*</span>
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={handleRoleChange}
                        >
                            <option value="tourist">Tourist</option>
                            <option value="provider">Service Provider</option>
                        </select>
                    </div>

                    {/* Provider Fields */}
                    {role === "provider" && (
                        <div className="provider-fields">
                            {/* Service Type */}
                            <div className="field-group">
                                <label className="form-label" htmlFor="service_type">
                                    Service Type <span className="required-star">*</span>
                                </label>
                                <select
                                    id="service_type"
                                    name="service_type"
                                    value={formData.service_type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={hasFieldError("service_type") ? "input-error" : ""}
                                >
                                    <option value="">Select Service Type</option>
                                    <option value="Hotel">Hotel Owner</option>
                                    <option value="Restaurant">Restaurant Owner</option>
                                    <option value="Transportation">Transportation Owner</option>
                                    <option value="Activity">Activity Owner</option>
                                </select>
                                {hasFieldError("service_type") && (
                                    <p className="field-error">{errors.service_type}</p>
                                )}
                            </div>

                            {/* Business Name */}
                            <div className="field-group">
                                <label className="form-label" htmlFor="business_name">
                                    Business Name <span className="required-star">*</span>
                                </label>
                                <input
                                    id="business_name"
                                    type="text"
                                    name="business_name"
                                    placeholder="Enter your business name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={hasFieldError("business_name") ? "input-error" : ""}
                                />
                                {hasFieldError("business_name") && (
                                    <p className="field-error">{errors.business_name}</p>
                                )}
                            </div>

                            {/* License Number */}
                            <div className="field-group">
                                <label className="form-label" htmlFor="license_number">
                                    License Number <span className="required-star">*</span>
                                </label>
                                <input
                                    id="license_number"
                                    type="text"
                                    name="license_number"
                                    placeholder="Enter your license number"
                                    value={formData.license_number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={hasFieldError("license_number") ? "input-error" : ""}
                                />
                                {hasFieldError("license_number") && (
                                    <p className="field-error">{errors.license_number}</p>
                                )}
                            </div>

                            {/* Certificate Upload */}
                            <div className="field-group">
                                <label className="form-label" htmlFor="certificate">
                                    Registration Certificate <span className="required-star">*</span>
                                </label>
                                <input
                                    id="certificate"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    onBlur={() => {
                                        setTouched((prev) => ({ ...prev, certificate: true }));
                                        const certError = validateField("certificate", formData.certificate, formData, role);
                                        setErrors((prev) => ({ ...prev, certificate: certError }));
                                    }}
                                    className={hasFieldError("certificate") ? "input-error" : ""}
                                />
                                {hasFieldError("certificate") && (
                                    <p className="field-error">{errors.certificate}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                    </button>

                    <p className="login-text">
                        Do you have an account?{" "}
                        <Link to="/login">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;