"use client";
import { useEffect, useState, useCallback } from "react";
import Loading from "../loading/page";
import AuthWrapper from "../components/AuthWrapper";
import "./orderspage.css";
import "./modal.css";
// import BottomNav from "../components/BottomNav";
import Link from "next/link"; // Added for redirecting to mainpage if needed
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const OSMMap = dynamic(() => import("../components/OSMMap"), { ssr: false });

export default function AcceptedOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOGIC FROM FIRST: State to track if driver is already busy
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);

  // RE-ADDED: track active status
  const [isActive, setIsActive] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deliveryBoyActiveStatus");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // ✅ FIXED LOGIC FROM FIRST: Define current user and check state here
  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const hasActiveOrder = orders.some(o => o.deliveryBoyId === currentUserId && o.status !== "Delivered");

  // FIRST CODE'S fetchOrders function
  const fetchOrders = useCallback(async () => {
    try {
      const deliveryBoyId = localStorage.getItem("userId");

      if (!deliveryBoyId) {
        console.warn("No userId in localStorage");
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }

      // Check active status from localStorage on every fetch to stay synced
      const savedStatus = localStorage.getItem("deliveryBoyActiveStatus");
      if (savedStatus !== null) {
        setIsActive(JSON.parse(savedStatus));
      }

      // LOGIC FROM FIRST: Call your Accepted Deliveries API
      const activeRes = await fetch("/api/accepted-deliveries");
      const activeData = await activeRes.json();
      if (activeData.success) {
        // If any order in the list belongs to this driver, they are busy
        const isBusy = activeData.data.some(d => d.deliveryBoyId === deliveryBoyId);
        setHasActiveDelivery(isBusy);
      }

      // If NOT active, we don't even need to fetch new orders, but let's fetch to be safe or just return empty?
      // The user wants "not receive orders".
      // Let's continue fetching so we know if there are orders, but we will block the view below.

      const res = await fetch(
        `/api/acceptedorders?deliveryBoyId=${deliveryBoyId}`
      );

      if (!res.ok) {
        console.error("API error:", res.status);
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const ordersArray = Array.isArray(data) ? data : [];

      // Filter orders where current user hasn't rejected
      const filtered = ordersArray.filter(order =>
        !order.rejectedBy?.includes(deliveryBoyId)
      );

      setOrders(ordersArray);
      setFilteredOrders(filtered);
      setLoading(false);
    } catch (err) {
      console.error("Fetch failed:", err);
      // setOrders([]);
      // setFilteredOrders([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Set up polling every 3 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 3000);

    // Cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchOrders]);

  // Modal State
  const [modal, setModal] = useState({
    show: false,
    type: "success", // 'success' or 'error'
    title: "",
    message: "",
    onConfirm: null, //
  });

  const [mapModal, setMapModal] = useState({
    show: false,
    lat: null,
    lng: null,
    title: ""
  });

  const closeModal = () => {
    setModal({ ...modal, show: false });
  };


  useEffect(() => {
    if (mapModal.show) {
      document.body.classList.add('map-open');
    } else {
      document.body.classList.remove('map-open');
    }
    return () => document.body.classList.remove('map-open');
  }, [mapModal.show]);

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({
      show: true,
      type,
      title,
      message,
      onConfirm: onConfirm || (() => setModal(prev => ({ ...prev, show: false }))),
    });
  };

  // ✅ FIRST CODE'S ACCEPT ORDER
  const router = useRouter();

  const acceptOrderFirst = async (orderId) => {
    const deliveryBoyId = localStorage.getItem("userId");

    if (!deliveryBoyId) {
      showModal("error", "Login Expired", "Please login again.");
      return;
    }

    // Check if delivery boy is active
    if (!isActive) {
      showModal("error", "Inactive Status", "You must be Active to accept orders!");
      return;
    }

    // LOGIC FROM FIRST: Prevent acceptance if already busy
    if (hasActiveDelivery || hasActiveOrder) {
      showModal("error", "Busy", "Finish your active order first!");
      return;
    }

    try {
      const res = await fetch("/api/acceptedorders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryBoyId }),
      });
      const serverData = await res.json();
      if (!res.ok) {
        // If the server sends 409 (Conflict), serverData.message will be "Too late!..."
        showModal("error", "Failed", serverData.message, () => {
          // Remove from list immediately so the boy doesn't try again
          setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
          closeModal();
        });
        return;
      }

      // Update both orders states
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));

      showModal("success", "Success!", "Order accepted successfully", () => {
        router.push("/Activedeliveries");
      });

    } catch (err) {
      console.error(err);
      showModal("error", "Error", "Something went wrong");
    }
  };

  const openMap = (order) => {
    let lat = null;
    let lng = null;
    let title = order.restaurantName || "Delivery Location";

    const url = order.rest;
    if (url) {
      const match = url.match(/query=([-.\d]+),([-.\d]+)/) || url.match(/q=([-.\d]+),([-.\d]+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
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

  // ❌ FIRST CODE'S REJECT ORDER
  const rejectOrderFirst = async (orderId) => {
    const deliveryBoyId = localStorage.getItem("userId");

    if (!deliveryBoyId) {
      showModal("error", "Login Expired", "Please login again.");
      return;
    }

    await fetch("/api/acceptedorders/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, deliveryBoyId }),
    });

    // Update both orders states
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) return <Loading />;

  return (
    <AuthWrapper>
      <div className="orders-page-container">
        {/* Header from Design */}
        <div className="spv-header">
          <div className="header-icon"></div>
          <div>
            <div className="spv-title">SPV</div>
            <div className="header-text">Delivery partner app</div>
            <div className="header-text">Thanks for your service</div>
          </div>
        </div>

        {/* Active Delivery Warning */}
        {(hasActiveDelivery || hasActiveOrder) && (
          <div className="bg-red-600 text-white p-4 rounded-lg mx-4 mb-4 font-bold text-center shadow-sm">
            ⚠️ ACTIVE DELIVERY IN PROGRESS. FINISH IT TO ACCEPT NEW ORDERS.
          </div>
        )}

        {/* Inactive State */}
        {!isActive ? (
          <div className="text-center py-12 mx-4 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">⏸️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              You are currently Inactive
            </h3>
            <p className="text-gray-600 mb-4">
              Please go to the Home page and set yourself as Active to see and accept delivery orders.
            </p>
            <Link href="/mainpage" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 text-decoration-none">
              Go to Home
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders-wrapper">
            <div className="empty-state-icon">
              <i className="bi bi-box2-heart"></i>
            </div>
            <h3 className="empty-state-title">No Orders Yet</h3>
            <p className="empty-state-subtitle">We are looking for new requests nearby. Stay tuned!</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const deliveryBoyId = localStorage.getItem("userId");
              const hasRejected = order.rejectedBy?.includes(deliveryBoyId);

              // Skip rendering if user has rejected this order
              if (hasRejected) return null;

              return (
                <div key={order._id} className="order-card">
                  <div className="order-row">
                    <div className="row-label">Restaurant</div>
                    <div className="row-separator">-</div>
                    <div className="row-value">{order.restaurantName || order.restaurantId}</div>
                  </div>

                  <div className="order-row">
                    <div className="row-label">Location</div>
                    <div className="row-separator">-</div>
                    <div className="row-value">
                      <span className="location-badge">
                        {order.rest ? (
                          <button
                            type="button"
                            onClick={() => openMap(order)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'inherit',
                              textDecoration: 'underline',
                              padding: 0,
                              cursor: 'pointer'
                            }}
                          >
                            View Map
                          </button>
                        ) : (
                          "Restaurant location"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="order-row">
                    <div className="row-label">Distance</div>
                    <div className="row-separator">-</div>
                    <div className="row-value">
                      {order.location?.distanceText}
                    </div>
                  </div>

                  <div className="order-row">
                    <div className="row-label">Delivery fee</div>
                    <div className="row-separator">-</div>
                    <div className="row-value">
                      {order.deliveryCharge && `₹ ${order.deliveryCharge} `}
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-accept"
                      onClick={() => acceptOrderFirst(order._id)}
                      disabled={hasActiveDelivery || hasActiveOrder}
                      style={{ opacity: (hasActiveDelivery || hasActiveOrder) ? 0.5 : 1 }}
                    >
                      Accept order
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => rejectOrderFirst(order._id)}
                    >
                      Reject order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {mapModal.show && (
        <div className="modal-overlay">
          <div className="map-modal-card">
            <div className="d-flex justify-content-end align-items-center w-100 mb-2 px-1">

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

          </div>
        </div>
      )}

      {/* CUSTOM MODAL */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className={`modal-icon ${modal.type === 'success' ? 'icon-success' : 'icon-error'}`}>
              <span className="icon-content">
                {modal.type === 'success' ? '✓' : '✕'}
              </span>
            </div>
            <h3 className="modal-title">{modal.title}</h3>
            <p className="modal-message">{modal.message}</p>
            <button className="modal-button" onClick={modal.onConfirm}>
              {modal.type === 'success' ? 'Continue' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* <BottomNav /> */}
    </AuthWrapper>
  );
}