import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SubmitHiddenSpot() {
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", { state: { returnUrl: "/hidden-spots?share=true" } });
        } else {
            navigate("/hidden-spots?share=true", { replace: true });
        }
    }, [navigate]);

    return (
        <div
            style={{
                background: "#0f172a",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: "13px",
            }}
        >
            Opening Hidden Spots submission...
        </div>
    );
}
