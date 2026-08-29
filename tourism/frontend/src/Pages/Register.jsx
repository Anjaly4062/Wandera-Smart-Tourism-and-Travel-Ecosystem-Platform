import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";
import Swal from "sweetalert2";

function Register() {

    const [role, setRole] = useState("tourist");

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
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

    e.preventDefault();

    let validationErrors = {};

      
    if (!formData.full_name.trim()) {
        alert("Full Name is required.");
        return;
    }

    if (!formData.email.trim()) {
        alert("Email is required.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address.");
        return;
    }

    
    if (!formData.password) {
        alert("Password is required.");
        return;
    }

    if (formData.password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

   
    if (!formData.confirm_password) {
        alert("Confirm Password is required.");
        return;
    }

    if (formData.password !== formData.confirm_password) {
        alert("Passwords do not match.");
        return;
    }

    
    if (role === "provider") {

        if (!formData.service_type) {
            alert("Please select a Service Type.");
            return;
        }

        if (!formData.business_name.trim()) {
            alert("Business Name is required.");
            return;
        }

        if (!formData.license_number.trim()) {
            alert("License Number is required.");
            return;
        }

        if (!formData.certificate) {
            alert("Please upload your Registration Certificate.");
            return;
        }

    }

    if (Object.keys(validationErrors).length > 0) {
        return;
    }

    try {

        if (role === "tourist") {

            const res = await api.post(
                "tourist-register/",
                formData
            );

            alert(res.data.message);

        } else {

            const providerData = new FormData();

            providerData.append("full_name", formData.full_name);
            providerData.append("email", formData.email);
            providerData.append("password", formData.password);
            providerData.append("service_type", formData.service_type);
            providerData.append("business_name", formData.business_name);
            providerData.append("license_number", formData.license_number);
            providerData.append("certificate", formData.certificate);

            const res = await api.post(
                "provider-register/",
                providerData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert(res.data.message);

        }

    } catch (err) {

        alert(err.response?.data?.message || "Registration Failed");

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


                <form onSubmit={handleSubmit}>


                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                    />

                    {errors.full_name && (
                        <p className="error">{errors.full_name}</p>
                    )}


                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {errors.email && (
                        <p className="error">{errors.email}</p>
                    )}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {errors.password && (
                        <p className="error">{errors.password}</p>
                    )}


                    <input
                        type="password"
                        name="confirm_password"
                        placeholder="Confirm Password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                    />

                    {errors.confirm_password && (
                        <p className="error">{errors.confirm_password}</p>
                    )}


                    <select
                    value={role}
                    onChange={(e)=>setRole(e.target.value)}
                    >

                        <option value="tourist">
                            Tourist
                        </option>

                        <option value="provider">
                            Service Provider
                        </option>

                    </select>



                    {
                    role==="provider" &&

                    <div className="provider-fields">


                        <select
                            name="service_type"
                            value={formData.service_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Service Type</option>
                            <option value="Hotel">Hotel Owner</option>
                            <option value="Restaurant">Restaurant Owner</option>
                            <option value="Transportation">Transportation Owner</option>
                            <option value="Activity">Activity Owner</option>
                        </select>

                        {errors.service_type && (
                            <p className="error">{errors.service_type}</p>
                        )}


                        <input
                            type="text"
                            name="business_name"
                            placeholder="Business Name"
                            value={formData.business_name}
                            onChange={handleChange}
                        />

                        {errors.business_name && (
                            <p className="error">{errors.business_name}</p>
                        )}


                        <input
                            type="text"
                            name="license_number"
                            placeholder="License Number"
                            value={formData.license_number}
                            onChange={handleChange}
                        />

                        {errors.license_number && (
                            <p className="error">{errors.license_number}</p>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    certificate: e.target.files[0]
                                })
                            }
                        />

                        {errors.certificate && (
                            <p className="error">{errors.certificate}</p>
                        )}


                    </div>

                    }
                    


                    <button type="submit">

                        Register

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