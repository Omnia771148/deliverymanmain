"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

export default function MainPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayEarnings: 0,
        totalOrders: 0,
        monthlyEarnings: 0
    });
    const [loading, setLoading] = useState(true);
    const [deliveryBoyId, setDeliveryBoyId] = useState("");

    // Active status state
    const [isActive, setIsActive] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("deliveryBoyActiveStatus");
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    // Fetch Stats and Status
    const fetchData = useCallback(async () => {
        try {
            const storedUserId = localStorage.getItem("userId");
            if (!storedUserId) {
                // Redirect or show login message
                // router.push("/deliveryboy/login"); // Optional: auto-redirect
                setLoading(false);
                return;
            }
            setDeliveryBoyId(storedUserId);

            // 1. Fetch Status
            try {
                const statusRes = await fetch(`/api/delivery/status?deliveryBoyId=${storedUserId}`);
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    const savedStatus = localStorage.getItem("deliveryBoyActiveStatus");

                    // Sync with server if local is different/missing, but prioritize local intent if recent?
                    // The logic from orderspage prioritizes local if it exists and matches? 
                    // Actually orderspage logic said: "Only update if saved status matches API value" - wait, that logic was weird in orderspage.
                    // Let's just trust the API for the initial load, but update localstorage to match.
                    setIsActive(statusData.isActive);
                    localStorage.setItem("deliveryBoyActiveStatus", JSON.stringify(statusData.isActive));
                }
            } catch (err) {
                console.error("Error fetching status:", err);
            }

            // 2. Fetch Stats
            try {
                const statsRes = await fetch(`/api/delivery-stats?deliveryBoyId=${storedUserId}`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.data);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }

        } catch (err) {
            console.error("Error in fetchData:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        const intervalId = setInterval(() => {
            fetchData();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Toggle Status Handler
    const toggleActiveStatus = async () => {
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) return;

        const newStatus = !isActive;
        setIsActive(newStatus);
        localStorage.setItem("deliveryBoyActiveStatus", JSON.stringify(newStatus));

        try {
            await fetch("/api/delivery/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deliveryBoyId: storedUserId,
                    isActive: newStatus,
                }),
            });
            // No need to alert, UI is optimistic
        } catch (err) {
            console.error("Status update failed:", err);
            // Revert if critical? But usually fine to keep local optimistic.
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#F9F7F2", minHeight: "100vh", paddingBottom: "80px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

            {/* Header */}
            <div className="p-4 pt-5 pb-3">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                        <div style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                        }}>
                            {/* Placeholder Logo/Icon */}
                            <span style={{ fontSize: "20px", fontWeight: "bold", fontStyle: "italic" }}>SPV</span>
                        </div>
                    </div>
                    <div className="text-end">
                        <p className="m-0 fw-bold" style={{ fontSize: "14px", color: "#333" }}>Delivery partner app</p>
                        <p className="m-0" style={{ fontSize: "14px", color: "#666" }}>Thanks for your service</p>
                    </div>
                </div>

                {/* Active Toggle Card */}
                <div
                    className="card border-0 shadow-sm mt-4 overflow-hidden"
                    style={{ borderRadius: "20px", backgroundColor: "#E6DCCA" }}
                >
                    <div className="card-body p-2 d-flex">
                        <div
                            onClick={() => {
                                if (!isActive) toggleActiveStatus();
                                router.push("/orderspage");
                            }}
                            style={{
                                flex: 1,
                                backgroundColor: isActive ? "#28a745" : "transparent",
                                color: isActive ? "#fff" : "#666",
                                borderRadius: "15px",
                                padding: "15px",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                fontWeight: "500"
                            }}
                        >
                            {isActive ? "Now you are active" : "Tap here to go to Active"}
                        </div>
                        <div
                            onClick={isActive ? toggleActiveStatus : undefined}
                            style={{
                                flex: 1,
                                backgroundColor: !isActive ? "#dc3545" : "transparent",
                                color: !isActive ? "#fff" : "#666",
                                borderRadius: "15px",
                                padding: "15px",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                fontWeight: "500"
                            }}
                        >
                            {!isActive ? "Now you are inactive" : "Tap here to inactive"}
                        </div>
                    </div>
                </div>

                {/* Notification Setup Card */}
                <div
                    className="card border-0 shadow-sm mt-3 overflow-hidden"
                    style={{ borderRadius: "20px", backgroundColor: "#fff" }}
                >
                    <div className="card-body p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <h6 className="mb-1 fw-bold" style={{ color: "#333" }}>Enable Notifications</h6>
                            <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>Get instant alerts on your mobile</p>
                        </div>
                        <button
                            onClick={() => {
                                if (deliveryBoyId) {
                                    window.location.href = `notificationapp://setup?userId=${deliveryBoyId}`;
                                } else {
                                    alert("User ID not found. Please login again.");
                                }
                            }}
                            className="btn btn-primary rounded-pill px-4"
                            style={{ fontSize: "14px", fontWeight: "600" }}
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="px-3">
                {/* Row 1: Today Orders & Earnings */}
                <div className="row g-3 mb-3">
                    <div className="col-6">
                        <div className="card border-0 h-100" style={{ backgroundColor: "#E2DAC4", borderRadius: "20px" }}>
                            <div className="card-body text-center py-4">
                                <h6 className="card-title text-decoration-underline mb-3" style={{ fontWeight: "bold", color: "#111" }}>Today orders</h6>
                                <h2 className="display-4 fw-bold mb-0" style={{ color: "#111" }}>{stats.todayOrders}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card border-0 h-100" style={{ backgroundColor: "#E2DAC4", borderRadius: "20px" }}>
                            <div className="card-body text-center py-4">
                                <h6 className="card-title text-decoration-underline mb-3" style={{ fontWeight: "bold", color: "#111" }}>Today earnings</h6>
                                <h2 className="display-6 fw-bold mb-0" style={{ color: "#111" }}>
                                    {/* Assuming negative sign was just a dash in the design or implies logic. Showing plain value. */}
                                    {stats.todayEarnings} Rs
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Monthly Record */}
                <div className="card border-0 mb-4" style={{ backgroundColor: "#E2DAC4", borderRadius: "20px" }}>
                    <div className="card-body py-4">
                        <h6 className="text-center text-decoration-underline fw-bold mb-4" style={{ color: "#111" }}>Monthly record</h6>
                        <div className="row text-center align-items-center">
                            <div className="col-5 border-end border-secondary">
                                <p className="mb-1 fw-bold" style={{ fontSize: "14px" }}>Total no of orders</p>
                                <h2 className="fw-bold mb-0">{stats.totalOrders}</h2>
                                {/* Note: Design says "Total no of orders" under Monthly Record. 
                            Usually this means Total All Time or Monthly? 
                            The card title is "Monthly record", but text is "Total no of orders".
                            I'll map it to stats.totalOrders (All time) as per text, or monthOrders? 
                            The API returns both. Let's use totalOrders for now as it says "Total".
                        */}
                            </div>
                            <div className="col-7">
                                <p className="mb-1 fw-bold" style={{ fontSize: "14px" }}>Monthly earnings</p>
                                <h2 className="fw-bold mb-0">{stats.monthlyEarnings} Rs</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            {/* Bottom Navigation */}
            <BottomNav />

        </div>
    );
}
