"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";
// import BottomNav from "../components/BottomNav";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryBoyId, setDeliveryBoyId] = useState("");

    // Filter State: '1day', '3days', '1week', '1month'
    const [filterPeriod, setFilterPeriod] = useState("all");

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setDeliveryBoyId(storedUserId);
            fetchCompletedOrders(storedUserId);
        } else {
            setLoading(false);
            console.error("No userId found in localStorage");
        }
    }, []);

    // Initial load updates both orders and filtered orders
    const fetchCompletedOrders = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/complete-order?deliveryBoyId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setOrders(data.data);
                setFilteredOrders(data.data); // Default to showing all
            }
        } catch (error) {
            console.error("Error fetching completed orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        if (!orders.length) {
            setFilteredOrders([]);
            return;
        }

        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        const filtered = orders.filter(order => {
            if (filterPeriod === "all") return true;

            const orderDate = new Date(order.completedAt || order.updatedAt || order.createdAt);
            const diffTime = now - orderDate;

            switch (filterPeriod) {
                case "1day":
                    return diffTime <= oneDay;
                case "3days":
                    return diffTime <= 3 * oneDay;
                case "1week":
                    return diffTime <= 7 * oneDay;
                case "1month":
                    return diffTime <= 30 * oneDay;
                default:
                    return true;
            }
        });

        setFilteredOrders(filtered);

    }, [filterPeriod, orders]);

    // Calculate Total Earnings for the current filtered view
    const totalEarnings = filteredOrders.reduce((sum, order) => {
        return sum + (Number(order.deliveryCharge) || 0);
    }, 0);


    if (loading) {
        return <Loading />;
    }

    if (!deliveryBoyId) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#dc3545" }}>
                Please login to view delivery history. No delivery boy ID found.
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f7f7eb", // Light cream page background
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
                {/* Back Button */}
                <button
                    onClick={() => window.history.back()}
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

                {/* Title Pill */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "12px 30px",
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    <i className="bi bi-bag-check-fill" style={{ fontSize: "24px" }}></i>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>My Orders</h2>
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                padding: "5px 0 20px 0",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch"
            }}>
                {[
                    { id: "all", label: "All" },
                    { id: "1day", label: "24h" },
                    { id: "3days", label: "3 Days" },
                    { id: "1week", label: "1 Week" },
                    { id: "1month", label: "1 Month" }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setFilterPeriod(opt.id)}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "50px",
                            border: "none",
                            backgroundColor: filterPeriod === opt.id ? "#1C1C1C" : "#fff",
                            color: filterPeriod === opt.id ? "#fff" : "#1C1C1C",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            fontSize: "14px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                            cursor: "pointer"
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Earnings Summary Card */}
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "30px",
                padding: "20px 25px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
            }}>
                <div>
                    <span style={{ fontSize: "14px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Total Earnings</span>
                    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#28a745" }}>₹{totalEarnings}</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "14px", color: "#888", fontWeight: "600", textTransform: "uppercase" }}>Deliveries</span>
                    <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#333" }}>{filteredOrders.length}</h2>
                </div>
            </div>

            {/* Orders List Container */}
            <div style={{
                backgroundColor: "#E6DCC8", // Tan container background
                borderRadius: "40px",
                padding: "20px",
                maxWidth: "600px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#7A6F5D", fontWeight: "600" }}>
                        No orders found for this period.
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order._id}
                            style={{
                                backgroundColor: "#fff",
                                borderRadius: "30px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ minWidth: 0 }}>

                                    <span style={{
                                        fontSize: "15px",
                                        color: "#fff",
                                        fontWeight: "800",
                                        backgroundColor: "#28a745",
                                        padding: "6px 15px",
                                        borderRadius: "50px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        letterSpacing: "0.5px"
                                    }}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        DELIVERED
                                    </span>
                                </div>
                                <div style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "5px 12px",
                                    borderRadius: "15px",
                                    textAlign: "right"
                                }}>
                                    <span style={{ display: "block", fontSize: "11px", color: "#888", fontWeight: "700" }}>EARNINGS</span>
                                    <span style={{ fontSize: "16px", fontWeight: "800", color: "#1C1C1C" }}>₹{order.deliveryCharge || 0}</span>
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderTop: "1px dashed #eee",
                                paddingTop: "10px",
                                marginTop: "5px"
                            }}>
                                <span style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>
                                    <i className="bi bi-calendar3" style={{ marginRight: "5px" }}></i>
                                    {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : "Date N/A"}
                                </span>
                                <span style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>
                                    <i className="bi bi-clock" style={{ marginRight: "5px" }}></i>
                                    {order.completedAt ? new Date(order.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                </span>
                            </div>

                            <div style={{
                                fontSize: "11px",
                                color: "#999",
                                fontWeight: "600",
                                textAlign: "center",
                                marginTop: "5px"
                            }}>
                                ID: {order.orderId || "N/A"}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* <BottomNav /> */}
        </div>
    );
}
