"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import BottomNav from "../components/BottomNav";
import Loading from "../loading/page";
import AuthWrapper from "../components/AuthWrapper";
import styles from "./myprofile.module.css";

export default function MyProfileMenu() {
    const router = useRouter();
    const [user, setUser] = useState({
        name: "",
        phone: ""
    });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const name = localStorage.getItem("deliveryBoyName");
        const phone = localStorage.getItem("deliveryBoyPhone");

        setUser({
            name: name || "Delivery Partner",
            phone: phone || ""
        });

        const timer = setTimeout(() => setIsPageLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("deliveryBoyName");
        localStorage.removeItem("deliveryBoyPhone");
        localStorage.removeItem("loginTimestamp");
        localStorage.removeItem("deliveryBoyActiveStatus");

        // Redirect to login
        router.push("/deliveryboy/login");
    };


    if (isPageLoading || isNavigating) {
        return <Loading />;
    }

    const handleMenuClick = (path) => {
        setIsNavigating(true);
        router.push(path);
    };

    return (
        <AuthWrapper>
            <div className={styles.pageContainer}>

            <div className="container pt-4">

                {/* Setting Title Pill */}
                <div className="d-flex justify-content-center">
                    <div className={`d-inline-flex align-items-center px-4 py-2 mb-4 bg-white shadow-sm ${styles.settingPill}`}>
                        <i className={`bi bi-gear-fill me-2 ${styles.settingIcon}`}></i>
                        <span className={styles.settingText}>Settings</span>
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white shadow-sm mb-4" style={{ borderRadius: '25px', padding: '15px 20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#333', color: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', marginRight: '15px' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111', lineHeight: '1.2' }}>{user.name || "Delivery Partner"}</span>
                        <span style={{ fontSize: '14px', color: '#888', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                            <i className="bi bi-telephone-fill" style={{ color: '#c29a6e', marginRight: '8px', fontSize: '12px' }}></i>
                            {user.phone || "No phone added"}
                        </span>
                    </div>
                </div>

                {/* Main Menu Card */}
                <div className={`p-4 shadow-sm ${styles.mainCard}`}>

                    <div className="d-flex flex-column gap-3">
                        {/* My Profile Link */}
                        <div onClick={() => handleMenuClick("/mydetails")} className="text-decoration-none" style={{ cursor: 'pointer' }}>
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-person-fill text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>My Profile</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </div>

                        {/* My Orders Link */}
                        <div onClick={() => handleMenuClick("/myorders")} className="text-decoration-none" style={{ cursor: 'pointer' }}>
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-bag-check-fill text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>My Orders</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </div>


                        {/* My Reviews Link */}
                        <div onClick={() => handleMenuClick("/myprofile/reviews")} className="text-decoration-none" style={{ cursor: 'pointer' }}>
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-star-fill text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>My Reviews</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </div>

                        <div onClick={() => handleMenuClick("/contactus")} className="text-decoration-none" style={{ cursor: 'pointer' }}>
                            <div className={`d-flex align-items-center justify-content-between bg-white px-4 py-3 shadow-sm ${styles.menuItem}`}>
                                <div className="d-flex align-items-center">
                                    <i className={`bi bi-envelope text-black ${styles.menuIcon}`}></i>
                                    <span className={styles.menuText}>Contact Us</span>
                                </div>
                                <i className={`bi bi-play-fill text-black ${styles.arrowIcon}`}></i>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className={styles.logoutButton} onClick={handleLogout}>
                            <div className={styles.logoutLeft}>
                                <i className={`bi bi-box-arrow-right ${styles.logoutIcon}`}></i>
                                <span>Logout</span>
                            </div>
                            <i className={`bi bi-caret-right-fill ${styles.logoutArrow}`}></i>
                        </div>
                    </div>

                </div>

            </div>
            {/* <BottomNav /> */}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.iconCircle}>
                            {/* Logout/Exclamation Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </div>
                        <div className={styles.modalMessage}>
                            Are you sure you want to logout?
                        </div>
                        <button className={styles.confirmButton} onClick={confirmLogout}>
                            Logout
                        </button>
                        <button className={styles.cancelButton} onClick={() => setShowLogoutModal(false)}>
                            Not now
                        </button>
                    </div>
                </div>
            )}
            </div>
        </AuthWrapper>
    );
}
