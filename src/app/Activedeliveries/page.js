"use client";

import { useState, useEffect } from "react";
import Loading from "../loading/page"; 

export default function ActiveDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({});
  const [deliveryBoyId, setDeliveryBoyId] = useState("");

  useEffect(() => {
    // Get delivery boy ID from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setDeliveryBoyId(storedUserId);
      fetchDeliveries(storedUserId);
    } else {
      setLoading(false);
      console.error("No userId found in localStorage");
    }
  }, []);

  const fetchDeliveries = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accepted-deliveries");
      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (data.success) {
        // Filter deliveries by deliveryBoyId matching localStorage userId
        const filteredDeliveries = data.data.filter(
          delivery => delivery.deliveryBoyId === userId
        );
        
        setDeliveries(filteredDeliveries);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
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

  const verifyRazorpayId = (delivery) => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!deliveryBoyId) {
    return <div>Please login to view deliveries. No delivery boy ID found.</div>;
  }
  if (loading) return <Loading />;
  return (
    <div>
      <h1>Accepted Deliveries</h1>
      <p>Delivery Boy ID: {deliveryBoyId}</p>
      <p>Total: {deliveries.length} deliveries</p>
      
      <div>
        {deliveries.map((delivery) => (
          <div key={delivery._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
            {!delivery ? (
              <p>Delivery data is null or undefined</p>
            ) : (
              <>
                {/* Basic Info */}
                <p><strong>Order ID:</strong> {delivery.orderId || "Not available"}</p>
                <p><strong>Original Order ID:</strong> {delivery.originalOrderId || "Not available"}</p>
                <p><strong>Status:</strong> {delivery.status || "Not available"}</p>
                <p><strong>Customer ID:</strong> {delivery.userId || "Not available"}</p>
                <p><strong>Restaurant ID:</strong> {delivery.restaurantId || "Not available"}</p>
                <p><strong>Delivery Person ID:</strong> {delivery.deliveryBoyId || "Not available"}</p>
                
                {/* Price Details */}
                <p><strong>Total Items:</strong> {delivery.totalCount || 0}</p>
                <p><strong>Total Price:</strong> ₹{delivery.totalPrice || 0}</p>
                <p><strong>GST:</strong> ₹{delivery.gst || 0}</p>
                <p><strong>Delivery Charge:</strong> ₹{delivery.deliveryCharge || 0}</p>
                <p><strong>Grand Total:</strong> ₹{delivery.grandTotal || 0}</p>
                <p><strong>AA:</strong> {delivery.aa || "Not available"}</p>
                
                {/* Payment Info */}
                <p><strong>Payment Status:</strong> {delivery.paymentStatus || "Not available"}</p>
                <p><strong>Razorpay Order ID:</strong> {delivery.razorpayOrderId || "Not available"}</p>
                <p><strong>Razorpay Payment ID:</strong> {delivery.razorpayPaymentId || "Not available"}</p>
                
                {/* Razorpay Verification Input */}
                <div style={{ margin: "10px 0", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
                  <p><strong>Verify Razorpay Order ID:</strong></p>
                  <p>Enter last 5 digits of Razorpay Order ID:</p>
                  <input
                    type="text"
                    value={inputValues[delivery._id] || ""}
                    onChange={(e) => handleInputChange(delivery._id, e.target.value)}
                    placeholder="Enter last 5 digits"
                    style={{ padding: "5px", marginRight: "10px" }}
                    maxLength="5"
                  />
                  <button
                    onClick={() => verifyRazorpayId(delivery)}
                    style={{ padding: "5px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}
                  >
                    Verify
                  </button>
                </div>
                
                {/* Dates */}
                <p><strong>Order Date:</strong> {delivery.orderDate ? new Date(delivery.orderDate).toLocaleString() : "Not available"}</p>
                <p><strong>Accepted At:</strong> {delivery.acceptedAt ? new Date(delivery.acceptedAt).toLocaleString() : "Not available"}</p>
                
                {/* Check Location */}
                {delivery.location ? (
                  <div>
                    <p><strong>Location:</strong></p>
                    <p>Lat: {delivery.location.lat || "Not set"}</p>
                    <p>Lng: {delivery.location.lng || "Not set"}</p>
                    <p>Map URL: {delivery.location.mapUrl || "Not set"}</p>
                  </div>
                ) : (
                  <p><strong>Location:</strong> No location data</p>
                )}
                
                {/* Additional Fields */}
                <p><strong>Rest:</strong> {delivery.rest || "Not available"}</p>
                <p><strong>Rejected By:</strong> {delivery.rejectedBy?.length > 0 ? delivery.rejectedBy.join(", ") : "None"}</p>
                
                {/* Check Items */}
                {delivery.items && delivery.items.length > 0 ? (
                  <div>
                    <strong>Items ({delivery.items.length}):</strong>
                    <ul>
                      {delivery.items.map((item, index) => (
                        <li key={index}>
                          {item?.name || "No name"} (ID: {item?.itemId || "No ID"}) - 
                          Qty: {item?.quantity || 0} × ₹{item?.price || 0} = ₹{(item?.price || 0) * (item?.quantity || 0)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p><strong>Items:</strong> No items data</p>
                )}
                
                {/* Check if timestamps exist */}
                <p><strong>Created At:</strong> {delivery.createdAt ? new Date(delivery.createdAt).toLocaleString() : "Not available"}</p>
                <p><strong>Updated At:</strong> {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString() : "Not available"}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}