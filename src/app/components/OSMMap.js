"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically handle leaflet-routing-machine to avoid SSR and ensure L is defined
let RoutingMachine;
if (typeof window !== 'undefined') {
    require('leaflet-routing-machine');
}

// Custom marker icons
const destinationIcon = L.icon({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const currentIcon = L.icon({
    iconUrl: '/delivery.png', // Using the delivery.png from public folder
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
});

// Component to handle the routing logic
const RoutingControl = ({ start, end }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !start || !end || !L.Routing) return;

        // Remove existing routing control if any
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        try {
            routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(start[0], start[1]),
                    L.latLng(end[0], end[1])
                ],
                lineOptions: {
                    styles: [{ color: '#3498db', weight: 6, opacity: 0.8 }]
                },
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false, // Don't snap view every time start position moves slightly
                showAlternatives: false,
                createMarker: () => null // Hide default markers created by routing machine
            }).addTo(map);

            // Hide the instructions panel
            const container = routingControlRef.current.getContainer();
            if (container) {
                container.style.display = 'none';
            }
        } catch (error) {
            console.error("Leaflet Routing error:", error);
        }

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, start, end]);

    return null;
};

// Main Map Component
const OSMMap = ({ lat, lng, title, onFullScreenClose }) => {
    const [currentPos, setCurrentPos] = useState(null);
    const [isRoutingActive, setIsRoutingActive] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const watchIdRef = useRef(null);

    // Initial destination coordinates
    const destination = [lat, lng];

    // Function to start watching live location
    const startLiveTracking = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        // Clear existing watch if any
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Live position update:", latitude, longitude);
                setCurrentPos([latitude, longitude]);
                setLocationError(null);
            },
            (error) => {
                console.warn("Location access error:", error);
                if (error.code === 1) {
                    setLocationError("Please enable location access (GPS) in your browser settings");
                } else {
                    setLocationError("Unable to retrieve your live location");
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000, // Reuse location if it's less than 5s old
                timeout: 15000
            }
        );
    };

    const stopLiveTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    useEffect(() => {
        // Start tracking as soon as the map loads
        startLiveTracking();

        return () => {
            stopLiveTracking();
        };
    }, []);

    if (!lat || !lng) return <div className="p-4 text-center">Invalid destination coordinates.</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F5F0' }}>
            {/* Error Message Display */}
            {locationError && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '10px',
                    textAlign: 'center',
                    border: '1px solid #ef9a9a',
                    zIndex: 2000
                }}>
                    ⚠️ {locationError}
                </div>
            )}

            <div style={{
                flexGrow: 1,
                width: '100%',
                borderRadius: 'inherit',
                overflow: 'hidden',
                border: 'none',
                position: 'relative',
                minHeight: '300px',
                backgroundColor: '#F8F5F0'
            }}>
                <MapContainer
                    center={destination}
                    zoom={15}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%', backgroundColor: '#F8F5F0' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={destination} icon={destinationIcon}>
                        <Popup>
                            {title || "Delivery Location"}
                        </Popup>
                    </Marker>

                    {/* My Live Location Marker */}
                    {currentPos && (
                        <Marker position={currentPos} icon={currentIcon}>
                            <Popup>
                                <strong>You (Live Location)</strong>
                            </Popup>
                        </Marker>
                    )}

                    {/* Directions Routing */}
                    {isRoutingActive && currentPos && (
                        <RoutingControl start={currentPos} end={destination} />
                    )}
                </MapContainer>
            </div>

            {/* Floating Action Buttons Area */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '15px',
                padding: '0 5px'
            }}>
                <button
                    onClick={() => {
                        setIsRoutingActive(!isRoutingActive);
                        if (!isRoutingActive && currentPos === null) {
                            startLiveTracking();
                        }
                    }}
                    style={{
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '30px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        flex: 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span>{isRoutingActive ? '✕ STOP DIRECTIONS' : '🛵 LIVE DIRECTIONS'}</span>
                </button>

                <button
                    onClick={startLiveTracking}
                    style={{
                        backgroundColor: '#000000',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '30px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    REFRESH GPS
                </button>
            </div>
        </div>
    );
};

export default OSMMap;
