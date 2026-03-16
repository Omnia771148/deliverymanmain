"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../loading/page";
// import BottomNav from "../components/BottomNav";

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
        return <Loading />;
    }

    return (
        <div style={{ backgroundColor: "#f7f7eb", minHeight: "100vh", paddingBottom: "80px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

            {/* Header */}
            <div className="p-4 pt-5 pb-3">
                {/* Ribbon Header Card */}
                <div style={{
                    backgroundColor: "#E3D5C2",
                    borderRadius: "20px",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    minHeight: "70px",
                    marginBottom: "20px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
                }}>
                    {/* White Circle Logo */}
                    <div style={{
                        width: "45px",
                        height: "45px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        flexShrink: 0
                    }}></div>

                    {/* Centered LEEVON Text */}
                    <div style={{
                        position: "absolute",
                        left: "0",
                        right: "0",
                        textAlign: "center",
                        pointerEvents: "none"
                    }}>
                        <span style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            fontStyle: "italic",
                            fontFamily: "'Times New Roman', serif",
                            color: "#333",
                            letterSpacing: "3px",
                            textTransform: "uppercase"
                        }}>
                            LEEVON
                        </span>
                    </div>
                </div>

                {/* Active Toggle Card */}
                <div
                    className="card border-0 shadow-sm mt-4 overflow-hidden"
                    style={{ borderRadius: "20px", backgroundColor: "#E3D5C2" }}
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
                            {"Active"}
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
                            {"Inactive"}
                        </div>
                    </div>
                </div>


            </div>

            {/* Stats Section */}
            <div className="px-3">
                {/* Row 1: Today Orders & Earnings */}
                <div className="row g-3 mb-3">
                    <div className="col-6">
                        <div className="card border-0 h-100" style={{ backgroundColor: "#E3D5C2", borderRadius: "20px" }}>
                            <div className="card-body text-center py-4">
                                <h6 className="card-title text-decoration-underline mb-3" style={{ fontWeight: "bold", color: "#111" }}>Today orders</h6>
                                <h2 className="display-4 fw-bold mb-0" style={{ color: "#111" }}>{stats.todayOrders}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card border-0 h-100" style={{ backgroundColor: "#E3D5C2", borderRadius: "20px" }}>
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
                <div className="card border-0 mb-4" style={{ backgroundColor: "#E3D5C2", borderRadius: "20px" }}>
                    <div className="card-body py-4">
                        <h6 className="text-center text-decoration-underline fw-bold mb-4" style={{ color: "#111" }}>Monthly record</h6>
                        <div className="row text-center align-items-center">
                            <div className="col-6 border-end border-secondary">
                                <p className="mb-1 fw-bold" style={{ fontSize: "14px" }}>Total orders</p>
                                <h2 className="fw-bold mb-0">{stats.totalOrders}</h2>
                            </div>
                            <div className="col-6">
                                <p className="mb-1 fw-bold" style={{ fontSize: "14px" }}>Monthly earnings</p>
                                <h2 className="fw-bold mb-0">{stats.monthlyEarnings} Rs</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            </br>
            <br></br>
            <br>
            </br>
            <br></br>
            <br>    
            </br>

            {/* Bottom Navigation */}
            {/* Bottom Navigation */}
            {/* <BottomNav /> */}

        </div>
    );
}
