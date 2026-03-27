"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import BottomNav from "../components/BottomNav";
import Loading from "../loading/page";
import AuthWrapper from "../components/AuthWrapper";

export default function MyDetails() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            const storedUserId = localStorage.getItem("userId");
            if (!storedUserId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/deliveryboy/details?id=${storedUserId}`);
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                } else {
                    console.error("Failed to fetch user details");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    if (loading) return <Loading />;
    if (!user) return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <p>User details not found. Please log in again.</p>
        </div>
    );

    return (
        <AuthWrapper>
            <div style={{
            minHeight: "100vh",
            backgroundColor: "#f7f7eb",
            padding: "20px",
            paddingBottom: "100px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Header Area */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                padding: "10px 0",
                marginBottom: "30px",
                width: "100%"
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        position: "absolute",
                        left: "0",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        cursor: "pointer"
                    }}
                >
                    <i className="bi bi-arrow-left" style={{ fontSize: "24px", fontWeight: "bold" }}></i>
                </button>

                <div style={{
                    backgroundColor: "#fff",
                    padding: "12px 30px",
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    <i className="bi bi-person-fill" style={{ fontSize: "24px" }}></i>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>My Profile</h2>
                </div>
            </div>

            {/* Main Content Card */}
            <div style={{
                backgroundColor: "#E6DCC8",
                borderRadius: "40px",
                padding: "25px",
                maxWidth: "450px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
            }}>
                {/* PERSONAL SECTION */}
                <SectionLabel text="Personal Details" />
                <DetailItem icon="bi-person" text={user.name} label="Full Name" />
                <DetailItem icon="bi-telephone" text={user.phone} label="Phone" />
                <DetailItem icon="bi-envelope" text={user.email} label="Email" />
                <DetailItem icon="bi-hash" text={user._id} label="Partner ID" isSmall />

                {/* BANK SECTION */}
                <SectionLabel text="Bank Details" />
                <DetailItem icon="bi-bank" text={user.accountNumber} label="A/C Number" />
                <DetailItem icon="bi-building" text={user.ifscCode} label="IFSC Code" />

                {/* DOCUMENTS SECTION */}
                <SectionLabel text="Documents" />
                <DetailItem icon="bi-file-earmark-person" text={user.aadharNumber} label="Aadhar" url={user.aadharUrl} />
                <DetailItem icon="bi-car-front" text={user.rcNumber} label="RC Book" url={user.rcUrl} />
                <DetailItem icon="bi-card-list" text={user.licenseNumber} label="License" url={user.licenseUrl} />

                <DetailItem
                    icon="bi-calendar4"
                    label="Joined"
                    text={(() => {
                        const date = new Date(user.createdAt);
                        return isNaN(date.getTime()) ? "N/A" : date.toISOString().split('T')[0];
                    })()}
                />

            </div>

            {/* <BottomNav /> */}
            </div>
        </AuthWrapper>
    );
}

function SectionLabel({ text }) {
    return (
        <div style={{
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#7A6F5D",
            marginLeft: "20px",
            marginTop: "10px",
            marginBottom: "5px"
        }}>
            {text}
        </div>
    );
}

function DetailItem({ icon, text, label, url, isSmall }) {
    return (
        <div style={{
            backgroundColor: "#fff",
            borderRadius: "50px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}>
            <div style={{ width: "24px", textAlign: "center", flexShrink: 0 }}>
                <i className={`bi ${icon}`} style={{ fontSize: "20px" }}></i>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "10px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>{label}</span>
                <span style={{
                    fontSize: isSmall ? "13px" : "15px",
                    fontWeight: "600",
                    color: "#333",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {text}
                </span>
            </div>
            {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#333",
                    textDecoration: "none"
                }}>
                    VIEW
                </a>
            )}
        </div>
    );
}
