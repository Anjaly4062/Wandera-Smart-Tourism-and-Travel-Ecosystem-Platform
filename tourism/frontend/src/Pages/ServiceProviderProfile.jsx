import { useState, useEffect } from "react";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import api from "../services/api";
import "../styles/ServiceProviderProfile.css";

export default function ServiceProviderProfile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        business_name: "",
        license_number: "",
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);

    // Change Password state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const fetchProfile = async () => {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`provider-profile/${userId}/`);
            if (response.data) {
                setProfileData(response.data);
                setEditFormData({
                    full_name: response.data.full_name || "",
                    email: response.data.email || "",
                    phone: response.data.phone || "",
                    business_name: response.data.business_name || "",
                    license_number: response.data.license_number || "",
                });
            }
        } catch (error) {
            console.error("Error fetching provider profile:", error);
            // Fallback from localStorage
            setProfileData({
                user_id: userId,
                full_name: localStorage.getItem("name") || "Service Provider",
                email: localStorage.getItem("email") || "provider@wandera.com",
                phone: "Not Provided",
                role: "service_provider",
                status: "active",
                service_type: localStorage.getItem("service_type") || "Service Provider",
                business_name: "My Business",
                license_number: "N/A",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChangeInput = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        setUpdatingProfile(true);
        try {
            const response = await api.put(`provider-profile/${userId}/`, editFormData);
            if (response.status === 200) {
                alert("Profile updated successfully!");
                if (editFormData.full_name) localStorage.setItem("name", editFormData.full_name);
                if (editFormData.email) localStorage.setItem("email", editFormData.email);
                setIsEditing(false);
                fetchProfile();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.response?.data?.error || "Failed to update profile.");
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        if (passwordData.new_password !== passwordData.confirm_password) {
            alert("New passwords do not match!");
            return;
        }

        if (passwordData.new_password.length < 4) {
            alert("New password must be at least 4 characters long.");
            return;
        }

        setUpdatingPassword(true);
        try {
            const response = await api.post(`change-password/${userId}/`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });

            if (response.status === 200) {
                alert("Password changed successfully!");
                setPasswordData({
                    current_password: "",
                    new_password: "",
                    confirm_password: "",
                });
                setIsChangingPassword(false);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert(error.response?.data?.error || "Failed to change password.");
        } finally {
            setUpdatingPassword(false);
        }
    };

    const initialLetter = profileData?.full_name ? profileData.full_name.charAt(0).toUpperCase() : "P";

    return (
        <div className="provider-profile-container">
            <ServiceProviderNavbar />

            <main className="provider-profile-main">
                <div className="profile-page-header">
                    <h1>My Profile</h1>
                    <p>View and manage your service provider account details</p>
                </div>

                {loading ? (
                    <div className="profile-loading">Loading profile details...</div>
                ) : (
                    <>
                        {/* HERO CARD */}
                        <div className="profile-card">
                            <div className="profile-hero-row">
                                <div className="profile-hero-left">
                                    <div className="profile-avatar-circle">{initialLetter}</div>
                                    <div className="profile-user-meta">
                                        <h2>{profileData?.full_name}</h2>
                                        <p>{profileData?.business_name ? `${profileData.business_name} • ${profileData.service_type || "Service Provider"}` : profileData?.email}</p>
                                        <div className={profileData?.status === "active" ? "status-badge-active" : "status-badge-inactive"}>
                                            <span>●</span> {profileData?.status ? profileData.status.toUpperCase() : "ACTIVE"} ACCOUNT
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-hero-actions">
                                    <button
                                        className="btn-profile-edit"
                                        onClick={() => {
                                            setIsEditing(!isEditing);
                                            setIsChangingPassword(false);
                                        }}
                                    >
                                        ✏️ {isEditing ? "Cancel Editing" : "Edit Profile"}
                                    </button>
                                    <button
                                        className="btn-profile-password"
                                        onClick={() => {
                                            setIsChangingPassword(!isChangingPassword);
                                            setIsEditing(false);
                                        }}
                                    >
                                        🔒 {isChangingPassword ? "Cancel Password" : "Change Password"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* EDIT PROFILE FORM */}
                        {isEditing && (
                            <div className="edit-form-card">
                                <div className="edit-form-header">
                                    <h3>✏️ Edit Profile Details</h3>
                                </div>
                                <form onSubmit={handleProfileSubmit}>
                                    <div className="edit-form-grid">
                                        <div className="modal-form-group">
                                            <label>Full Name <span>*</span></label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={editFormData.full_name}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>Email Address <span>*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>Contact Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editFormData.phone}
                                                onChange={handleEditChange}
                                                placeholder="e.g. +91 9876543210"
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>Business Name</label>
                                            <input
                                                type="text"
                                                name="business_name"
                                                value={editFormData.business_name}
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>License Number</label>
                                            <input
                                                type="text"
                                                name="license_number"
                                                value={editFormData.license_number}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-footer-actions">
                                        <button
                                            type="button"
                                            className="btn-modal-cancel"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-modal-save"
                                            disabled={updatingProfile}
                                        >
                                            {updatingProfile ? "Saving..." : "Save Profile Changes"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* CHANGE PASSWORD FORM */}
                        {isChangingPassword && (
                            <div className="edit-form-card">
                                <div className="edit-form-header">
                                    <h3>🔒 Change Account Password</h3>
                                </div>
                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="modal-form-group" style={{ marginBottom: "14px" }}>
                                        <label>Current Password <span>*</span></label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="edit-form-grid">
                                        <div className="modal-form-group">
                                            <label>New Password <span>*</span></label>
                                            <input
                                                type="password"
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handlePasswordChangeInput}
                                                required
                                            />
                                        </div>

                                        <div className="modal-form-group">
                                            <label>Confirm New Password <span>*</span></label>
                                            <input
                                                type="password"
                                                name="confirm_password"
                                                value={passwordData.confirm_password}
                                                onChange={handlePasswordChangeInput}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-footer-actions">
                                        <button
                                            type="button"
                                            className="btn-modal-cancel"
                                            onClick={() => setIsChangingPassword(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-modal-save"
                                            disabled={updatingPassword}
                                        >
                                            {updatingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* VERTICAL DISPLAY DETAILS LIST */}
                        <div className="profile-vertical-list">
                            <div className="info-card-vertical">
                                <div className="info-vertical-left">
                                    <div className="info-vertical-icon">👤</div>
                                    <div>
                                        <div className="info-card-label">Full Name</div>
                                        <div className="info-card-value">{profileData?.full_name || "N/A"}</div>
                                    </div>
                                </div>
                                <div className="info-card-sub">Registered Account Name</div>
                            </div>

                            <div className="info-card-vertical">
                                <div className="info-vertical-left">
                                    <div className="info-vertical-icon">✉️</div>
                                    <div>
                                        <div className="info-card-label">Email Address</div>
                                        <div className="info-card-value">{profileData?.email || "N/A"}</div>
                                    </div>
                                </div>
                                <div className="info-card-sub">Login Email</div>
                            </div>

                            <div className="info-card-vertical">
                                <div className="info-vertical-left">
                                    <div className="info-vertical-icon">📞</div>
                                    <div>
                                        <div className="info-card-label">Contact Phone Number</div>
                                        <div className="info-card-value">{profileData?.phone || "Not Provided"}</div>
                                    </div>
                                </div>
                                <div className="info-card-sub">Contact Telephone Number</div>
                            </div>

                            <div className="info-card-vertical">
                                <div className="info-vertical-left">
                                    <div className="info-vertical-icon">🛡️</div>
                                    <div>
                                        <div className="info-card-label">Role & Service Type</div>
                                        <div className="info-card-value">
                                            {profileData?.service_type ? `${profileData.service_type} Provider` : "Service Provider"}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-card-sub">System Access Role</div>
                            </div>

                            {profileData?.business_name && (
                                <div className="info-card-vertical">
                                    <div className="info-vertical-left">
                                        <div className="info-vertical-icon">🏢</div>
                                        <div>
                                            <div className="info-card-label">Business Name</div>
                                            <div className="info-card-value">{profileData.business_name}</div>
                                        </div>
                                    </div>
                                    <div className="info-card-sub">Registered Business Name</div>
                                </div>
                            )}

                            {profileData?.license_number && (
                                <div className="info-card-vertical">
                                    <div className="info-vertical-left">
                                        <div className="info-vertical-icon">📄</div>
                                        <div>
                                            <div className="info-card-label">License Number</div>
                                            <div className="info-card-value">{profileData.license_number}</div>
                                        </div>
                                    </div>
                                    <div className="info-card-sub">Official License / Reg No.</div>
                                </div>
                            )}

                            {(profileData?.district || profileData?.location) && (
                                <div className="info-card-vertical">
                                    <div className="info-vertical-left">
                                        <div className="info-vertical-icon">📍</div>
                                        <div>
                                            <div className="info-card-label">Location / District</div>
                                            <div className="info-card-value">
                                                {profileData.location ? `${profileData.location}, ` : ""}{profileData.district || ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info-card-sub">Operating Hub</div>
                                </div>
                            )}

                            {profileData?.address && (
                                <div className="info-card-vertical">
                                    <div className="info-vertical-left">
                                        <div className="info-vertical-icon">🏠</div>
                                        <div>
                                            <div className="info-card-label">Full Address</div>
                                            <div className="info-card-value">{profileData.address}</div>
                                        </div>
                                    </div>
                                    <div className="info-card-sub">Official Address</div>
                                </div>
                            )}

                            <div className="info-card-vertical">
                                <div className="info-vertical-left">
                                    <div className="info-vertical-icon">⚡</div>
                                    <div>
                                        <div className="info-card-label">Account Status</div>
                                        <div className="info-card-value" style={{ textTransform: "capitalize" }}>
                                            {profileData?.status || "Active"}
                                        </div>
                                    </div>
                                </div>
                                <div className="info-card-sub">Account Verification Status</div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
