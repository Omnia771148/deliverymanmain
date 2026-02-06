"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";
// import BottomNav from "../components/BottomNav";

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [verifying, setVerifying] = useState(false);

  // State to manage which view is active for each delivery card: 'restaurant' (default) or 'user'
  const [viewMode, setViewMode] = useState({});

  useEffect(() => {
    // Get delivery boy ID from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setDeliveryBoyId(storedUserId);
      // Execute both fetch functions to ensure we get data
      fetchDeliveriesApproach1(storedUserId);
      fetchDeliveriesApproach2(storedUserId);
    } else {
      setLoading(false);
      console.error("No userId found in localStorage");
    }
  }, []);

  // FIRST FETCH APPROACH
  const fetchDeliveriesApproach1 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accepted-deliveries");
      const data = await response.json();

      if (data.success) {
        // Filter deliveries by deliveryBoyId matching localStorage userId
        const filteredDeliveries = data.data.filter(
          delivery => delivery.deliveryBoyId === userId
        );

        setDeliveries(prev => {
          const merged = [...prev];
          filteredDeliveries.forEach(newDelivery => {
            if (!merged.some(d => d._id === newDelivery._id)) {
              merged.push(newDelivery);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries (Approach 1):", error);
    } finally {
      setLoading(false);
    }
  };

  // SECOND FETCH APPROACH
  const fetchDeliveriesApproach2 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accepted-deliveries?deliveryBoyId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setDeliveries(prev => {
          const merged = [...prev];
          data.data.forEach(newDelivery => {
            if (!merged.some(d => d._id === newDelivery._id)) {
              merged.push(newDelivery);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.error("Error fetching deliveries (Approach 2):", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (orderId, value) => {
    setInputValues({
      ...inputValues,
      [orderId]: value
    });
  };

  const verifyRazorpayId = async (delivery) => {
    const userInput = inputValues[delivery._id] || "";
    const razorpayOrderId = delivery.razorpayOrderId;

    if (!razorpayOrderId) {
      alert("No Razorpay Order ID found for this order");
      return;
    }

    const last5Digits = razorpayOrderId.slice(-5);

    if (userInput === last5Digits) {
      try {
        setVerifying(true);

        const response = await fetch("/api/complete-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: delivery._id
          }),
        });

        const result = await response.json();

        if (result.success) {
          alert(`✅ Verification successful!\nOrder completed and moved to completed orders.\nTotal Amount: ₹${result.data.grandTotal}`);

          setDeliveries(prev => prev.filter(item => item._id !== delivery._id));

          setInputValues(prev => {
            const newValues = { ...prev };
            delete newValues[delivery._id];
            return newValues;
          });
        } else {
          alert(`❌ Failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to complete order. Please try again.");
      } finally {
        setVerifying(false);
      }
    } else {
      alert(`❌ Incorrect! Last 5 digits are: ${last5Digits}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!deliveryBoyId) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#dc3545" }}>
        Please login to view deliveries. No delivery boy ID found.
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px", color: "#333" }}>
        My Deliveries
      </h1>

      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          color: "#6c757d",
          border: "1px dashed #dee2e6"
        }}>
          No active deliveries found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {deliveries.map((delivery) => {
            const isUserView = viewMode[delivery._id] === 'user' || delivery.orderPickedUp;

            return (
              <div
                key={delivery._id}
                style={{
                  border: "1px solid #e1e4e8",
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  overflow: "hidden"
                }}
              >
                {/* 
                   VIEW 1: RESTAURANT & ITEMS
                   Shows when viewMode is NOT 'user'
                */}
                {!isUserView && (
                  <div style={{ padding: "20px" }}>
                    <div style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold", color: "#e67e22" }}>
                        Order ID: {delivery.orderId}
                      </p>
                      <h2 style={{ margin: "0 0 5px 0", fontSize: "20px", color: "#2c3e50" }}>
                        {delivery.rest || delivery.restaurantName || "Restaurant Name Not Available"}
                      </h2>
                      <a
                        href={delivery.location?.mapUrl || delivery.rest || `https://www.google.com/maps/search/?api=1&query=${delivery.location?.lat},${delivery.location?.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          marginTop: "5px",
                          color: "#007bff",
                          fontSize: "14px",
                          textDecoration: "none",
                          fontWeight: "500",
                          backgroundColor: "#e7f1ff",
                          padding: "5px 10px",
                          borderRadius: "20px"
                        }}
                      >
                        <span style={{ marginRight: "4px" }}>📍</span> View Restaurant Location
                      </a>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                      <h4 style={{ fontSize: "16px", color: "#333", marginBottom: "10px" }}>Items to Pick Up:</h4>
                      <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "10px" }}>
                        {delivery.items && delivery.items.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {delivery.items.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: "5px", fontSize: "15px", color: "#555" }}>
                                <span style={{ fontWeight: "bold", color: "#333" }}>{item.quantity} x </span>
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ margin: 0, color: "#999", fontStyle: "italic" }}>No item details available. {delivery.totalCount ? `(${delivery.totalCount} items)` : ""}</p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #c3e6cb" }}>
                      <span style={{ color: "#155724", fontWeight: "600" }}>Delivery Earnings:</span>
                      <span style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>₹{delivery.deliveryCharge || 0}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/delete-accepted-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ orderId: delivery.originalOrderId })
                            });

                            const data = await res.json();
                            if (data.success) {
                              setViewMode(prev => ({ ...prev, [delivery._id]: 'user' }));
                            } else {
                              console.error("Failed:", data.message);
                              // Still switch view if it fails? No, probably should stay. 
                              // But user said "It is not deleting". If API fails, we should probably let them know or retry.
                              // We will stick to simple: specific error => alert.
                              alert(data.message);
                            }
                          } catch (err) {
                            console.error("Error:", err);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px"
                        }}
                      >
                        Delete from Accepted
                      </button>
                    </div>
                  </div>
                )}

                {/* 
                   VIEW 2: CUSTOMER DETAILS & VERIFY
                   Shows when viewMode IS 'user'
                */}
                {isUserView && (
                  <div style={{ padding: "20px" }}>
                    {!delivery.orderPickedUp && (
                      <button
                        onClick={() => setViewMode(prev => ({ ...prev, [delivery._id]: 'restaurant' }))}
                        style={{ background: "none", border: "none", color: "#666", marginBottom: "15px", cursor: "pointer", fontSize: "14px", padding: 0 }}
                      >
                        ← Back to Order Details
                      </button>
                    )}

                    <h3 style={{ fontSize: "18px", borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "15px" }}>Customer Details</h3>

                    <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#888", fontSize: "13px" }}>Name:</span>
                        <span style={{ fontWeight: "600", color: "#333" }}>{delivery.userName || "Test User"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#888", fontSize: "13px" }}>Phone:</span>
                        <span style={{ fontWeight: "600", color: "#007bff" }}>
                          <a href={`tel:${delivery.userPhone || '9999999999'}`} style={{ color: "inherit", textDecoration: "none" }}>{delivery.userPhone || "9999999999"}</a>
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#888", fontSize: "13px" }}>Email:</span>
                        <span style={{ fontWeight: "600", color: "#333", fontSize: "13px" }}>{delivery.userEmail || "test@kushas.com"}</span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#f1f3f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                      <h4 style={{ fontSize: "14px", color: "#555", marginBottom: "8px", fontWeight: "bold" }}>Delivery Location</h4>
                      <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#333" }}>
                        {typeof delivery.deliveryAddress === 'string' ? delivery.deliveryAddress : (delivery.deliveryAddress?.street || "Address not provided")}
                      </p>

                      {delivery.location && (
                        <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
                          {delivery.location.flatNo && <div>Flat/House: {delivery.location.flatNo}</div>}
                          {delivery.location.street && <div>Street: {delivery.location.street}</div>}
                          {delivery.location.landmark && <div>Landmark: {delivery.location.landmark}</div>}
                        </div>
                      )}

                      {delivery.location && (delivery.location.lat || delivery.location.lng) && (
                        <div style={{ marginTop: "10px" }}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${delivery.location.lat},${delivery.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#e74c3c", fontWeight: "600", fontSize: "13px", textDecoration: "none" }}
                          >
                            <span style={{ marginRight: "5px" }}>📍</span> Open in Maps ({Number(delivery.location.lat).toFixed(4)}, {Number(delivery.location.lng).toFixed(4)})
                          </a>
                        </div>
                      )}
                      {!delivery.location && (
                        <div style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>Location Coordinates Unavailable</div>
                      )}
                    </div>

                    <div style={{ backgroundColor: "#e8f4fd", padding: "15px", borderRadius: "8px", border: "1px solid #b6d4fe" }}>
                      <label style={{ display: "block", marginBottom: "10px", color: "#004085", fontSize: "14px", fontWeight: "600" }}>
                        Verify Delivery (Last 5 digits)
                      </label>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <input
                          type="text"
                          value={inputValues[delivery._id] || ""}
                          onChange={(e) => handleInputChange(delivery._id, e.target.value)}
                          placeholder="Ex: 54321"
                          maxLength="5"
                          style={{
                            flex: 1,
                            padding: "10px",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            fontSize: "16px",
                            outline: "none"
                          }}
                        />
                        <button
                          onClick={() => verifyRazorpayId(delivery)}
                          disabled={verifying}
                          style={{
                            padding: "0 20px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: "600",
                            cursor: verifying ? "wait" : "pointer",
                            opacity: verifying ? 0.7 : 1,
                            transition: "background-color 0.2s"
                          }}
                        >
                          {verifying ? "..." : "Verify"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* <BottomNav /> */}
    </div>
  );
}