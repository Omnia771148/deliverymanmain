"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";
import dynamic from "next/dynamic";
// import BottomNav from "../components/BottomNav";
import "./activedeliveries.css";

// Dynamically import OSMMap to avoid SSR issues with Leaflet
const OSMMap = dynamic(() => import("../components/OSMMap"), { ssr: false });

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [verifying, setVerifying] = useState(false);

  // State to manage which view is active for each delivery card: 'restaurant' (default) or 'user'
  const [viewMode, setViewMode] = useState({});

  // Custom Modal State
  const [modal, setModal] = useState({
    show: false,
    message: "",
    title: "",
    type: "success" // 'success' or 'error'
  });

  // Map Modal State
  const [mapModal, setMapModal] = useState({
    show: false,
    lat: null,
    lng: null,
    title: ""
  });

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
    // Remove spaces from the input value for verification
    const rawInput = inputValues[delivery._id] || "";
    const userInput = rawInput.replace(/\s/g, "");
    const razorpayOrderId = delivery.razorpayOrderId;

    if (!razorpayOrderId) {
      alert("No Razorpay Order ID found for this order");
      return;
    }

    if (userInput.length < 5) {
      alert("Please enter the last 5 characters of the Order ID");
      return;
    }

    setVerifying(true);

    try {
      const last5Digits = razorpayOrderId.slice(-5);

      if (userInput === last5Digits) {
        // Correct ID - Complete Order
        await handleCompleteOrder(delivery);
      } else {
        setModal({
          show: true,
          title: "Invalid ID",
          message: "The digits you entered are incorrect. Please check and retry.",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setModal({
        show: true,
        title: "Error",
        message: "Something went wrong during verification. Please try again.",
        type: "error"
      });
    } finally {
      setVerifying(false); // Enable the button again
    }
  };

  const openMap = (delivery, isRestaurant = false) => {
    let lat = null;
    let lng = null;
    let title = "";

    if (isRestaurant) {
      title = delivery.restaurantName || "Restaurant";
      const url = delivery.rest;
      if (url) {
        const match = url.match(/query=([-.\d]+),([-.\d]+)/) || url.match(/q=([-.\d]+),([-.\d]+)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }
    } else {
      title = delivery.userName || "Customer";
      if (delivery.location && delivery.location.lat && delivery.location.lng) {
        lat = delivery.location.lat;
        lng = delivery.location.lng;
      }
    }

    if (lat && lng) {
      setMapModal({
        show: true,
        lat,
        lng,
        title
      });
    } else {
      alert("Coordinates not found for this location.");
    }
  };

  const handleCompleteOrder = async (delivery) => {
    try {
      // API call to complete order (Final step)
      const response = await fetch("/api/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: delivery._id // AcceptedByDelivery ID
        })
      });

      const data = await response.json();
      if (data.success) {
        setModal({
          show: true,
          title: "Order Completed",
          message: "Order has been moved to completed status.",
          type: "success"
        });
        // Remove from UI immediately
        setDeliveries(prev => prev.filter(item => item._id !== delivery._id));
        // Refresh list as well just in case
        fetchDeliveriesApproach1(deliveryBoyId);
        fetchDeliveriesApproach2(deliveryBoyId);
      } else {
        setModal({
          show: true,
          title: "Failed",
          message: data.message || "Could not complete order.",
          type: "error"
        });
      }

    } catch (error) {
      console.error("Complete order error:", error);
      setModal({
        show: true,
        title: "Error",
        message: "Network error occurred while completing the order.",
        type: "error"
      });
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
    <div className="ad-page-container">
      {/* Header */}
      <div className="ad-header">
        <div className="ad-header-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🛵</div>
        <div>
          <div className="ad-title">Active Deliveries</div>
          <div className="ad-header-text">Manage your ongoing tasks</div>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="ad-no-orders">
          <div style={{ fontSize: "60px", marginBottom: "15px", opacity: 0.5 }}>�</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>No Active Deliveries</h3>
          <p style={{ opacity: 0.8 }}>You have no ongoing deliveries at the moment.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
          {deliveries.map((delivery) => {
            const isUserView = viewMode[delivery._id] === 'user' || delivery.orderPickedUp;

            return (
              <div key={delivery._id} className="ad-card">

                {/* 
                   VIEW 1: RESTAURANT & ITEMS (The Main View)
                   Shows when viewMode is NOT 'user'
                */}
                {!isUserView && (
                  <>
                    <div className="ad-card-content">
                      {/* Left Column: Essential Details */}
                      <div className="ad-main-details">
                        <div>
                          <div className="ad-order-id">
                            <span>Order ID</span>
                            <div className="ad-order-value">{delivery.orderId}</div>
                          </div>

                          <div className="ad-restaurant-section">
                            <div className="ad-restaurant-name">
                              {delivery.restaurantName || "Restaurant Name Not Available"}
                            </div>

                            <button
                              type="button"
                              onClick={() => openMap(delivery, true)}
                              className="ad-location-badge"
                              style={{ marginTop: '5px', display: 'inline-flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}
                            >
                              <span style={{ marginRight: '5px' }}>📍</span> VIEW IN MAP
                            </button>
                          </div>
                        </div>

                        <div className="ad-earnings">
                          <span>DELIVERY FEE</span>
                          <div className="ad-earnings-amount">₹{delivery.deliveryCharge || 0}</div>
                        </div>
                      </div>

                      {/* Right Column: Items List */}
                      <div className="ad-items-column">
                        <div className="ad-items-title">ITEMS TO PICKUP</div>
                        <div className="ad-items-list">
                          {delivery.items && delivery.items.length > 0 ? (
                            delivery.items.map((item, idx) => (
                              <div key={idx} className="ad-item-row">
                                <span className="ad-item-name">{item.name}</span>
                                <span className="ad-item-qty">x{item.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <div className="ad-item-row" style={{ fontStyle: "italic", opacity: 0.7 }}>
                              {delivery.totalCount ? `${delivery.totalCount} items` : "No item details"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer with Button */}
                    <div className="ad-card-footer">
                      <button
                        className="ad-btn-pickup"
                        onClick={async () => {
                          try {
                            const res = await fetch("/api/delete-accepted-order", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderId: delivery.originalOrderId,
                                deliveryId: delivery._id
                              })
                            });

                            const data = await res.json();
                            if (data.success) {
                              setViewMode(prev => ({ ...prev, [delivery._id]: 'user' }));
                            } else {
                              console.error("Failed:", data.message);
                              alert(data.message);
                            }
                          } catch (err) {
                            console.error("Error:", err);
                          }
                        }}
                      >
                        PICKUP ORDER
                      </button>
                    </div>
                  </>
                )}

                {/* 
                   VIEW 2: USER DETAILS & VERIFY
                   Shows when viewMode IS 'user'
                */}
                {isUserView && (
                  <div className="ad-user-view-container">


                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>Customer Details</h3>

                      <div className="ad-customer-details">
                        <div className="ad-detail-row">
                          <span className="ad-detail-label">Name:</span>
                          <span style={{ fontWeight: 'bold' }}>{delivery.userName || "Customer"}</span>
                        </div>
                        <div className="ad-detail-row">
                          <span className="ad-detail-label">Phone:</span>
                          <span>
                            <a href={`tel:${delivery.userPhone}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 'bold' }}>{delivery.userPhone || "N/A"}</a>
                          </span>
                        </div>
                        <div className="ad-detail-row">
                          <span className="ad-detail-label">Address:</span>
                          <span style={{ flex: 1, fontSize: '0.95rem' }}>
                            {typeof delivery.deliveryAddress === 'string' ? delivery.deliveryAddress : (delivery.deliveryAddress?.street || "Address not provided")}
                          </span>
                        </div>

                        {delivery.location && (delivery.location.lat || delivery.location.lng) && (
                          <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => openMap(delivery, false)}
                              className="ad-location-badge"
                              style={{ backgroundColor: '#e1f5fe', color: '#0288d1', display: 'inline-flex', alignItems: 'center', border: 'none', cursor: 'pointer' }}
                            >
                              <span style={{ marginRight: '5px' }}>📍</span> Open Customer Map
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ad-verify-box">
                      <label className="ad-verify-title">
                        Verify Delivery (Last 5 Digits)
                      </label>
                      <div className="ad-verify-controls">
                        <div className="ad-otp-container">
                          {[0, 1, 2, 3, 4].map((index) => {
                            const fullStr = inputValues[delivery._id] || "     ";
                            const paddedStr = fullStr.padEnd(5, " ");
                            const char = paddedStr[index] === " " ? "" : paddedStr[index];

                            return (
                              <input
                                key={index}
                                id={`otp-${delivery._id}-${index}`}
                                type="text"
                                className="ad-otp-input"
                                maxLength={1}
                                value={char}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value;

                                  const digit = val.slice(-1);

                                  const current = inputValues[delivery._id] || "     ";
                                  const currentArr = current.padEnd(5, " ").split("");
                                  currentArr[index] = digit === "" ? " " : digit;

                                  const finalStr = currentArr.join("").slice(0, 5);
                                  handleInputChange(delivery._id, finalStr);

                                  if (digit && index < 4) {
                                    const nextInput = document.getElementById(`otp-${delivery._id}-${index + 1}`);
                                    if (nextInput) nextInput.focus();
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace") {
                                    if (!char && index > 0) {
                                      e.preventDefault();
                                      const current = inputValues[delivery._id] || "     ";
                                      const currentArr = current.padEnd(5, " ").split("");
                                      // Clear PREVIOUS slot
                                      currentArr[index - 1] = " ";
                                      handleInputChange(delivery._id, currentArr.join("").slice(0, 5));

                                      const prevInput = document.getElementById(`otp-${delivery._id}-${index - 1}`);
                                      if (prevInput) prevInput.focus();
                                    } else if (char) {
                                      // If current has char, verify logic:
                                      // Default behavior deletes char. 
                                      // We should update state to reflect empty at this index.
                                      // But onChange usually captures the "empty" state if we allow it?
                                      // Wait, standard backspace on non-empty input triggers onChange with empty string if maxLength=1?
                                      // YES. So we strictly need to handle STATE update here manually or rely on onChange?
                                      // onChange will fire with "" if we delete.
                                      // So let's leave char deletion to onChange.
                                    }
                                  }
                                }}
                                placeholder="-"
                              />
                            );
                          })}
                        </div>
                        <button
                          className="ad-btn-verify"
                          onClick={() => verifyRazorpayId(delivery)}
                          disabled={verifying}
                        >
                          {verifying ? "..." : "COMPLETE"}
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
      {/* Custom Alert Modal */}
      {modal.show && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-card">
            <div className={`ad-modal-icon-circle ${modal.type}`}>
              {modal.type === "success" ? "✓" : "✕"}
            </div>

            <div className="ad-modal-content">
              <h3 className="ad-modal-title">{modal.title}</h3>
              <p className="ad-modal-message">{modal.message}</p>

              <button
                className="ad-modal-btn"
                onClick={() => setModal({ ...modal, show: false })}
              >
                {modal.type === "success" ? "Continue" : "Retry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapModal.show && (
        <div className="ad-modal-overlay">
          <div className="ad-modal-card ad-map-modal-card">
            <div className="d-flex justify-content-between align-items-center w-100 mb-2 px-1">
              <h5 className="m-0 fw-bold">{mapModal.title}</h5>
              <button
                onClick={() => setMapModal({ ...mapModal, show: false })}
                className="btn-close"
                style={{ fontSize: "1.2rem", border: "none", background: "none", cursor: "pointer", color: "#333" }}
              >✕</button>
            </div>

            <div style={{ flexGrow: 1, width: '100%', minHeight: '300px' }}>
              <OSMMap
                lat={mapModal.lat}
                lng={mapModal.lng}
                title={mapModal.title}
              />
            </div>

            <div className="mt-3 w-100 text-center">
              <button
                className="ad-modal-btn w-100"
                onClick={() => setMapModal({ ...mapModal, show: false })}
                style={{ backgroundColor: '#e74c3c' }}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approach for spacing if needed */}
      <style jsx>{`
        .ad-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        .ad-modal-card {
           background: white;
           width: 85%;
           max-width: 320px;
           border-radius: 20px;
           padding: 30px 20px;
           display: flex;
           flex-direction: column;
           align-items: center;
           box-shadow: 0 10px 25px rgba(0,0,0,0.1);
           animation: adPopIn 0.3s ease-out;
        }
        .ad-modal-icon-circle {
           width: 70px;
           height: 70px;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 30px;
           color: white;
           font-weight: bold;
           margin-bottom: 20px;
        }
        .ad-modal-icon-circle.success {
           background-color: #4CAF50;
        }
        .ad-modal-icon-circle.error {
           background-color: #f44336;
        }
        .ad-modal-content {
           text-align: center;
        }
        .ad-modal-title {
           font-size: 1.4rem;
           font-weight: 700;
           color: #333;
           margin-bottom: 10px;
        }
        .ad-modal-message {
           font-size: 1rem;
           color: #666;
           line-height: 1.4;
           margin-bottom: 25px;
        }
        .ad-modal-btn {
           background: black;
           color: white;
           border: none;
           padding: 12px 40px;
           border-radius: 30px;
           font-size: 1.1rem;
           font-weight: 600;
           cursor: pointer;
           transition: transform 0.2s;
        }
        .ad-modal-btn:active {
           transform: scale(0.95);
        }
        .ad-map-modal-card {
            width: 95%;
            max-width: 500px;
            height: 80vh;
            padding: 15px;
            display: flex;
            flex-direction: column;
        }
        @media (max-width: 600px) {
            .ad-map-modal-card {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: 10px !important;
                position: fixed;
                top: 0;
                left: 0;
            }
        }
        @keyframes adPopIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}