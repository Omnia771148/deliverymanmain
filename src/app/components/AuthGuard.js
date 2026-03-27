"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Define public routes that don't require authentication
        const publicRoutes = [
            "/deliveryboy/login",
            "/deliveryboy/signup",
            "/deliveryboy/forgot-password",
            "/manifest.json" // standard assets
        ];

        const isPublicRoute = publicRoutes.includes(pathname);
        const loggedInUser = localStorage.getItem("userId");
        const loginTime = localStorage.getItem("loginTimestamp");

        // 1. Check if the session is expired (1 day limit)
        let isValidSession = false;
        if (loggedInUser && loginTime) {
            const currentTime = new Date().getTime();
            const oneDayInMs = 1 * 24 * 60 * 60 * 1000;
            if (currentTime - loginTime < oneDayInMs) {
                isValidSession = true;
            } else {
                // Session expired
                localStorage.removeItem("userId");
                localStorage.removeItem("deliveryBoyName");
                localStorage.removeItem("deliveryBoyPhone");
                localStorage.removeItem("loginTimestamp");
            }
        }

        // 2. Routing logic
        if (!isValidSession && !isPublicRoute) {
            // Not logged in, trying to access protected route -> redirect to login
            router.replace("/deliveryboy/login");
        } else if (isValidSession && isPublicRoute) {
            // Logged in, trying to access login/signup -> redirect to mainpage
            router.replace("/mainpage");
        } else {
            // They are where they are supposed to be!
            setIsChecking(false);
        }
    }, [pathname, router]);

    // Optional: Render a fallback or nothing while checking to prevent "flicker"
    if (isChecking) {
        return null; // Or a simple full-screen loading spinner
    }

    return <>{children}</>;
}
