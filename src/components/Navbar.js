"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navbar.css";

const Navbar = () => {
    const pathname = usePathname();

    const hiddenRoutes = ['/deliveryboy/login', '/deliveryboy/signup', '/deliveryboy/forgot-password'];

    if (hiddenRoutes.includes(pathname)) {
        return null;
    }

    // Navigation Items according to the requirement and image order:
    // 1. Home (House)
    // 2. Map (Folded Map / Location)
    // 3. Bag (Shopping Bag)
    // 4. Profile (Person)

    const navItems = [
        { name: 'Home', path: '/mainpage', icon: 'bi-house-fill' },
        { name: 'Bag', path: '/orderspage', icon: 'bi-bag-fill' },
        { name: 'Map', path: '/Activedeliveries', icon: 'bi-map-fill' },
        { name: 'Profile', path: '/myprofile', icon: 'bi-person-fill' },
    ];

    return (
        <div className="navbar-container nav-visible">
            {navItems.map((item, index) => {
                const isActive = pathname === item.path;
                return (
                    <Link key={index} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                        <i className={`bi ${item.icon} nav-icon`}></i>
                    </Link>
                );
            })}
        </div>
    );
};

export default Navbar;
