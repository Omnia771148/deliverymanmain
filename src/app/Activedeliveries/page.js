"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page";

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Get delivery boy ID from localStorage (FROM BOTH CODES)
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setDeliveryBoyId(storedUserId);
      // Execute both fetch functions (FROM BOTH CODES)
      fetchDeliveriesApproach1(storedUserId);
      fetchDeliveriesApproach2(storedUserId);
    } else {
      setLoading(false);
      console.error("No userId found in localStorage");
    }
  }, []);

  // FIRST CODE'S FETCH FUNCTION - NO CHANGES
  const fetchDeliveriesApproach1 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accepted-deliveries");
      const data = await response.json();
      
      console.log("API Response (Approach 1):", data);
      
      if (data.success) {
        // Filter deliveries by deliveryBoyId matching localStorage userId (FIRST CODE'S LOGIC)
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

  // SECOND CODE'S FETCH FUNCTION - NO CHANGES
  const fetchDeliveriesApproach2 = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accepted-deliveries?deliveryBoyId=${userId}`);
      const data = await response.json();
      
      console.log("API Response (Approach 2):", data);
      
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

  // HANDLE INPUT CHANGE - FROM BOTH CODES (SAME LOGIC)
  const handleInputChange = (orderId, value) => {
    setInputValues({
      ...inputValues,
      [orderId]: value
    });
  };

  // EXTRACTED FROM FIRST CODE: VERIFICATION FUNCTION THAT SENDS TO COLLECTION
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
        
        // EXTRACTED FROM FIRST CODE: API call to complete order
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
          
          // EXTRACTED FROM FIRST CODE: Update state after successful verification
          setDeliveries(prev => prev.filter(item => item._id !== delivery._id));
          
          // EXTRACTED FROM FIRST CODE: Clean up input values
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

  // SECOND CODE'S VERIFICATION FUNCTION (Basic) - KEPT FOR COMPATIBILITY
  const verifyRazorpayIdBasic = (delivery) => {
    const userInput = inputValues[delivery._id] || "";
    const razorpayOrderId = delivery.razorpayOrderId;
    
    if (!razorpayOrderId) {
      alert("No Razorpay Order ID found for this order");
      return;
    }
    
    const last5Digits = razorpayOrderId.slice(-5);
    
    if (userInput === last5Digits) {
      alert("Correct! Last 5 digits match.");
    } else {
      alert(`Incorrect. The last 5 digits of Razorpay Order ID are: ${last5Digits}`);
    }
  };

  // LOADING STATES FROM BOTH CODES
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!deliveryBoyId) {
    return <div>Please login to view deliveries. No delivery boy ID found.</div>;
  }
  
  // SECOND CODE'S LOADING COMPONENT
  if (loading) return <Loading />;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* TITLE SECTION - COMBINED FROM BOTH */}
      <h1>Accepted Deliveries</h1>
      <p>Delivery Boy ID: {deliveryBoyId}</p>
      <p>Total: {deliveries.length} deliveries</p>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        <strong>Total Active Deliveries:</strong> {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'}
      </p>
      
      {/* NO DELIVERIES MESSAGE - FROM SECOND CODE */}
      {deliveries.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px dashed #dee2e6"
        }}>
          <p style={{ fontSize: "18px", color: "#6c757d" }}>No active deliveries found.</p>
          <p style={{ color: "#adb5bd" }}>All deliveries have been completed or none are assigned to you.</p>
        </div>
      ) : (
        <div>
          {/* DELIVERIES LIST - FROM BOTH CODES */}
          {deliveries.map((delivery) => (
            <div 
              key={delivery._id} 
              style={{ 
                border: "1px solid #ccc", 
                margin: "10px 0", 
                padding: "20px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {!delivery ? (
                <p style={{ color: "#dc3545" }}>Delivery data is null or undefined</p>
              ) : (
                <>
                  {/* BASIC INFO - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ color: "#495057", borderBottom: "2px solid #007bff", paddingBottom: "10px" }}>
                      Order Details
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                      <div>
                        <p><strong>Order ID:</strong> {delivery.orderId || "Not available"}</p>
                        <p><strong>Original Order ID:</strong> {delivery.originalOrderId || "Not available"}</p>
                        <p><strong>Status:</strong> {delivery.status || "Not available"}</p>
                        <p><strong>Customer ID:</strong> {delivery.userId || "Not available"}</p>
                      </div>
                      <div>
                        <p><strong>Restaurant ID:</strong> {delivery.restaurantId || "Not available"}</p>
                        <p><strong>Delivery Person ID:</strong> {delivery.deliveryBoyId || "Not available"}</p>
                      </div>
                    </div>
                  </div>

                  {/* PRICE DETAILS - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px", backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>Price Details</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                      <p><strong>Total Items:</strong> {delivery.totalCount || 0}</p>
                      <p><strong>Total Price:</strong> ₹{delivery.totalPrice || 0}</p>
                      <p><strong>GST:</strong> ₹{delivery.gst || 0}</p>
                      <p><strong>Delivery Charge:</strong> ₹{delivery.deliveryCharge || 0}</p>
                      <p><strong>Grand Total:</strong> ₹{delivery.grandTotal || 0}</p>
                      <p style={{ fontWeight: "bold", color: "#28a745" }}>
                        <strong>Grand Total:</strong> ₹{delivery.grandTotal || 0}
                      </p>
                      <p><strong>AA:</strong> {delivery.aa || "Not available"}</p>
                    </div>
                  </div>

                  {/* PAYMENT INFO - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>Payment Information</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                      <div>
                        <p><strong>Payment Status:</strong> {delivery.paymentStatus || "Not available"}</p>
                        <p><strong>Razorpay Order ID:</strong> {delivery.razorpayOrderId || "Not available"}</p>
                        <p><strong>Razorpay Payment ID:</strong> {delivery.razorpayPaymentId || "Not available"}</p>
                        <p><strong>Razorpay Order ID:</strong> 
                          <code style={{
                            display: "block",
                            backgroundColor: "#e9ecef",
                            padding: "5px",
                            borderRadius: "4px",
                            marginTop: "5px",
                            fontSize: "0.9em",
                            wordBreak: "break-all"
                          }}>
                            {delivery.razorpayOrderId || "Not available"}
                          </code>
                        </p>
                      </div>
                      <div>
                        <p><strong>Razorpay Payment ID:</strong> 
                          <code style={{
                            display: "block",
                            backgroundColor: "#e9ecef",
                            padding: "5px",
                            borderRadius: "4px",
                            marginTop: "5px",
                            fontSize: "0.9em",
                            wordBreak: "break-all"
                          }}>
                            {delivery.razorpayPaymentId || "Not available"}
                          </code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SINGLE VERIFICATION SECTION - ADDED FROM FIRST CODE */}
                  <div style={{ 
                    marginBottom: "20px", 
                    padding: "20px", 
                    backgroundColor: "#e8f4fd", 
                    borderRadius: "8px",
                    border: "1px solid #b6d4fe"
                  }}>
                    <h4 style={{ color: "#004085", marginBottom: "15px" }}>Verify & Complete Delivery</h4>
                    <div style={{ marginBottom: "10px" }}>
                      <p style={{ color: "#856404", marginBottom: "5px" }}>
                        <strong>Instructions:</strong> Enter last 5 digits of Razorpay Order ID to verify and complete delivery.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <input
                          type="text"
                          value={inputValues[delivery._id] || ""}
                          onChange={(e) => handleInputChange(delivery._id, e.target.value)}
                          placeholder="Enter last 5 digits"
                          style={{ 
                            padding: "10px",
                            border: "1px solid #ced4da",
                            borderRadius: "4px",
                            flex: "1",
                            maxWidth: "200px",
                            fontSize: "16px"
                          }}
                          maxLength="5"
                          disabled={verifying}
                        />
                        
                        {/* MAIN VERIFY BUTTON - FROM FIRST CODE */}
                        <button
                          onClick={() => verifyRazorpayId(delivery)}
                          disabled={verifying || !inputValues[delivery._id] || inputValues[delivery._id].length !== 5}
                          style={{ 
                            padding: "10px 20px", 
                            backgroundColor: verifying ? "#6c757d" : 
                                         (!inputValues[delivery._id] || inputValues[delivery._id].length !== 5) ? "#6c757d" : "#28a745", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "4px",
                            cursor: verifying || (!inputValues[delivery._id] || inputValues[delivery._id].length !== 5) ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            transition: "background-color 0.2s"
                          }}
                        >
                          {verifying ? "Processing..." : "Verify & Complete"}
                        </button>
                      </div>
                      
                      {/* QUICK VERIFY BUTTON - FROM SECOND CODE */}
                      <button
                        onClick={() => verifyRazorpayIdBasic(delivery)}
                        style={{ 
                          padding: "5px 15px", 
                          backgroundColor: "#007bff", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "3px",
                          marginRight: "10px"
                        }}
                      >
                        Quick Verify Only
                      </button>
                      <p style={{ fontSize: "0.85em", color: "#6c757d", marginTop: "10px" }}>
                        <strong>Note:</strong> "Verify & Complete" will move the order to completed orders and remove it from active deliveries.
                      </p>
                    </div>
                  </div>

                  {/* DATES - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>Timestamps</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                      <p><strong>Order Date:</strong> {delivery.orderDate ? new Date(delivery.orderDate).toLocaleString() : "Not available"}</p>
                      <p><strong>Accepted At:</strong> {delivery.acceptedAt ? new Date(delivery.acceptedAt).toLocaleString() : "Not available"}</p>
                      <p><strong>Created At:</strong> {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : "Not available"}</p>
                      <p><strong>Updated At:</strong> {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString() : "Not available"}</p>
                    </div>
                  </div>

                  {/* LOCATION - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>Location Information</h4>
                    {delivery.location ? (
                      <div style={{ 
                        backgroundColor: "#f8f9fa", 
                        padding: "15px", 
                        borderRadius: "6px",
                        border: "1px solid #dee2e6"
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                          <p><strong>Latitude:</strong> {delivery.location.lat || "Not set"}</p>
                          <p><strong>Longitude:</strong> {delivery.location.lng || "Not set"}</p>
                        </div>
                        {delivery.location.mapUrl && (
                          <div style={{ marginTop: "10px" }}>
                            <p><strong>Map URL:</strong></p>
                            <a 
                              href={delivery.location.mapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                textDecoration: "none",
                                wordBreak: "break-all"
                              }}
                            >
                              {delivery.location.mapUrl.length > 50 
                                ? delivery.location.mapUrl.substring(0, 50) + "..." 
                                : delivery.location.mapUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "#6c757d" }}><strong>Location:</strong> No location data available</p>
                    )}
                  </div>

                  {/* ADDITIONAL FIELDS - FROM BOTH CODES */}
                  <div style={{ 
                    backgroundColor: "#f8f9fa", 
                    padding: "15px", 
                    borderRadius: "6px",
                    border: "1px solid #dee2e6",
                    marginBottom: "20px"
                  }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>Additional Information</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                      <div>
                        <p><strong>Rest:</strong> {delivery.rest || "Not available"}</p>
                      </div>
                      <div>
                        <p><strong>Rejected By:</strong> {delivery.rejectedBy?.length > 0 ? delivery.rejectedBy.join(", ") : "None"}</p>
                      </div>
                    </div>
                  </div>

                  {/* ITEMS - FROM BOTH CODES */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "#495057", marginBottom: "10px" }}>
                      Order Items ({delivery.items?.length || 0})
                    </h4>
                    {delivery.items && delivery.items.length > 0 ? (
                      <div style={{
                        backgroundColor: "#f8f9fa",
                        padding: "15px",
                        borderRadius: "6px",
                        border: "1px solid #dee2e6"
                      }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {delivery.items.map((item, index) => (
                            <li 
                              key={index} 
                              style={{
                                padding: "10px",
                                borderBottom: index < delivery.items.length - 1 ? "1px solid #dee2e6" : "none",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                            >
                              <div style={{ flex: "1" }}>
                                <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                                  {item?.name || "Unnamed Item"}
                                </p>
                                <p style={{ margin: 0, fontSize: "0.9em", color: "#6c757d" }}>
                                  ID: {item?.itemId || "No ID"}
                                </p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ margin: "0 0 5px 0" }}>
                                  {item?.quantity || 0} × ₹{item?.price || 0}
                                </p>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#28a745" }}>
                                  ₹{(item?.price || 0) * (item?.quantity || 0)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p style={{ color: "#6c757d" }}><strong>Items:</strong> No items data available</p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}