"use client";
import { useState } from "react";
import { auth } from "../../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "../../loading/page";
import "bootstrap/dist/css/bootstrap.min.css";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
    weight: "400",
    subsets: ["latin"],
});

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState("");

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{10}$/.test(phone)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Check if phone exists in DB
            const formattedPhone = "+91" + phone;
            const checkRes = await fetch("/api/deliveryboy/check-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formattedPhone })
            });
            const checkData = await checkRes.json();

            if (!checkData.success) {
                setError(checkData.message);
                setIsLoading(false);
                return;
            }

            // 2. Setup Recaptcha
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
                const container = document.getElementById('recaptcha-container');
                if (container) container.innerHTML = '';
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });

            // 3. Send OTP via Firebase
            const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setStep(2);

        } catch (err) {
            console.error("OTP Error:", err);
            setError("Failed to send OTP. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await confirmationResult.confirm(otp);
            // OTP Valid
            setStep(3);
        } catch (err) {
            console.error("Verify Error:", err);
            setError("Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const formattedPhone = "+91" + phone;
            const res = await fetch("/api/deliveryboy/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: formattedPhone, newPassword })
            });

            const data = await res.json();
            if (data.success) {
                alert("Password reset successfully! Please login.");
                router.push("/deliveryboy/login");
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Reset Error:", err);
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F9F7F1", padding: "20px", display: "flex", flexDirection: "column" }}>
            {isLoading && <Loading />}
            <div id="recaptcha-container"></div>
            
            {/* Nav Row */}
            <div style={{ position: "relative", width: "100%", height: "60px", marginBottom: "40px" }}>
                <button
                    onClick={() => window.location.href = "/"}
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "white",
                        border: "none",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        zIndex: "100"
                    }}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>
            </div>

            {/* Title Section */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 className={greatVibes.className} style={{ fontSize: "4rem", color: "#111", margin: "0", lineHeight: "1.2" }}>
                    Forgot Password?
                </h1>
                <p style={{ fontSize: "1.2rem", color: "#555", marginTop: "5px" }}>
                    Recover your account
                </p>
            </div>

            {error && <div className="alert alert-danger" style={{ fontSize: "14px", padding: "10px", borderRadius: "10px", margin: "0 20px 20px" }}>{error}</div>}

            {/* Card Form */}
            <div style={{
                backgroundColor: "#E2D3C1",
                margin: "0 10px",
                borderRadius: "30px",
                padding: "30px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            style={{
                                width: "100%",
                                padding: "15px 30px",
                                borderRadius: "30px",
                                border: "none",
                                outline: "none",
                                fontSize: "1rem",
                                color: "#333",
                                backgroundColor: "white",
                                marginBottom: "35px"
                            }}
                            required
                        />
                        
                        <button type="submit" style={{
                            backgroundColor: "white",
                            color: "black",
                            border: "none",
                            padding: "12px 50px",
                            borderRadius: "30px",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            marginBottom: "20px"
                        }}>
                            Send OTP
                        </button>

                        <button type="button" disabled style={{
                            backgroundColor: "rgba(255,255,255,0.4)",
                            color: "#333",
                            border: "none",
                            padding: "12px 50px",
                            borderRadius: "30px",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                        }}>
                            Reset Password
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <p style={{ color: "#555", fontSize: "0.9rem", textAlign: "center", marginBottom: "20px" }}>
                            OTP sent to +91 {phone}
                        </p>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "15px 30px",
                                borderRadius: "30px",
                                border: "none",
                                outline: "none",
                                fontSize: "1rem",
                                color: "#333",
                                backgroundColor: "white",
                                marginBottom: "35px"
                            }}
                            required
                        />
                        
                        <button type="submit" style={{
                            backgroundColor: "white",
                            color: "black",
                            border: "none",
                            padding: "12px 50px",
                            borderRadius: "30px",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            marginBottom: "20px"
                        }}>
                            Verify OTP
                        </button>

                        <button type="button" onClick={() => setStep(1)} style={{
                            background: "none",
                            border: "none",
                            color: "#555",
                            textDecoration: "underline",
                            fontSize: "0.9rem",
                            cursor: "pointer"
                        }}>
                            Change Number
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "15px 30px",
                                borderRadius: "30px",
                                border: "none",
                                outline: "none",
                                fontSize: "1rem",
                                color: "#333",
                                backgroundColor: "white",
                                marginBottom: "15px"
                            }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "15px 30px",
                                borderRadius: "30px",
                                border: "none",
                                outline: "none",
                                fontSize: "1rem",
                                color: "#333",
                                backgroundColor: "white",
                                marginBottom: "35px"
                            }}
                            required
                        />
                        
                        <button type="submit" style={{
                            backgroundColor: "white",
                            color: "black",
                            border: "none",
                            padding: "12px 50px",
                            borderRadius: "30px",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            marginBottom: "20px"
                        }}>
                            Update Password
                        </button>
                        
                        <button type="button" disabled style={{
                            backgroundColor: "rgba(255,255,255,0.4)",
                            color: "#333",
                            border: "none",
                            padding: "12px 50px",
                            borderRadius: "30px",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                        }}>
                            Reset Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

