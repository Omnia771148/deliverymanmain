"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading/page"; // Adjust path to your pizza loader

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      // If no ID found, redirect to login
      router.replace("/deliveryboy/login");
    } else {
      // User is logged in, show the content
      setIsAuthenticated(true);
    }
  }, [router]);

  // Show the Pizza Loader while checking the ID or redirecting
  if (!isAuthenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}