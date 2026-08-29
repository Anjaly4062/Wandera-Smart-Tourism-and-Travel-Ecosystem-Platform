import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";


function Login() {


    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");


    const navigate = useNavigate();
    const location = useLocation();
    const login = async () => {

    try {

        const res = await api.post("login/", {
            email,
            password,
        });

        // Check exactly what Django sends
        console.log("LOGIN RESPONSE:", res.data);
        console.log(
    "Provider ID received:",
    res.data.provider_id
);



        alert(res.data.message);


        // Store common user details
        localStorage.setItem(
            "user_id",
            res.data.user_id
        );

        localStorage.setItem(
            "name",
            res.data.name
        );

        localStorage.setItem(
            "email",
            res.data.email
        );

        localStorage.setItem(
            "role",
            res.data.role
        );


        // Store provider ID
        if (res.data.role === "service_provider") {

            console.log(
                "PROVIDER ID FROM DJANGO:",
                res.data.provider_id
            );

            localStorage.setItem(
                "provider_id",
                res.data.provider_id
            );

            if (res.data.service_type) {
                localStorage.setItem(
                    "service_type",
                    res.data.service_type
                );
            }

            console.log(
                "PROVIDER ID SAVED:",
                localStorage.getItem("provider_id"),
                "SERVICE TYPE SAVED:",
                localStorage.getItem("service_type")
            );
        }


        // Redirect based on role
        if (res.data.role === "admin") {

            navigate("/admin");

        }
        else if (res.data.role === "tourist") {

            const returnUrl = location.state?.returnUrl;
            if (returnUrl) {
                navigate(returnUrl);
            } else {
                navigate("/destinations");
            }

        }
        else if (res.data.role === "service_provider") {

            navigate("/provider-home");

        }

    } catch (err) {

        console.error(
            "Login Error:",
            err.response?.data
        );

        alert(
            err.response?.data?.message ||
            "Login failed"
        );
    }
};



    return (


        <div className="login-page">


            <div className="login-card">

                <Link to="/" className="back-home-link">
                    ← Back to Home
                </Link>

                <h1>
                    Welcome Back
                </h1>


                <p>
                    Login to continue your journey with Wandera
                </p>



                <input

                    type="email"

                    placeholder="Email Address"

                    onChange={(e)=>setEmail(e.target.value)}

                />



                <input

                    type="password"

                    placeholder="Password"

                    onChange={(e)=>setPassword(e.target.value)}

                />



                <button onClick={login}>

                    Login

                </button>



                <p className="register-text">

                    Don't have an account?{" "}


                    <Link to="/signup">

                        Register

                    </Link>


                </p>


            </div>


        </div>


    );

}


export default Login;