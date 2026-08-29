import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import api from "../services/api";

export default function AddService() {
    const navigate = useNavigate();

    useEffect(() => {
        const providerId = localStorage.getItem("provider_id");
        const storedServiceType = localStorage.getItem("service_type");

        const routeByProviderInfo = (provider) => {
            const st = (provider.service_type || storedServiceType || "").toLowerCase();

            if (st.includes("transport")) {
                if (provider.transportation) {
                    navigate("/provider/add-vehicle", {
                        replace: true,
                        state: { transportation_id: provider.transportation.transportation_id },
                    });
                } else {
                    navigate("/provider/add-transportation", { replace: true });
                }
            } else if (st.includes("restaurant")) {
                navigate("/provider/add-restaurant", { replace: true });
            } else if (st.includes("activity")) {
                if (provider.activity) {
                    navigate("/provider/add-activity-item", {
                        replace: true,
                        state: { activity_id: provider.activity.activity_id },
                    });
                } else {
                    navigate("/provider/add-activity", { replace: true });
                }
            } else {
                // Default to Hotel
                if (provider.hotel) {
                    navigate("/provider/add-room", {
                        replace: true,
                        state: { hotel_id: provider.hotel.hotel_id },
                    });
                } else {
                    navigate("/provider/add-hotel", { replace: true });
                }
            }
        };

        if (providerId) {
            api.get(`provider-info/${providerId}/`)
                .then((res) => {
                    if (res.data?.provider) {
                        routeByProviderInfo(res.data.provider);
                    } else {
                        navigate("/provider/add-hotel", { replace: true });
                    }
                })
                .catch(() => {
                    navigate("/provider/add-hotel", { replace: true });
                });
        } else {
            navigate("/provider/add-hotel", { replace: true });
        }
    }, [navigate]);

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />
            <main style={{ marginLeft: "250px", padding: "60px 50px", textAlign: "center", fontFamily: "Poppins, sans-serif" }}>
                <p style={{ fontSize: "14px", color: "#64748b" }}>Navigating to your account service form...</p>
            </main>
        </div>
    );
}