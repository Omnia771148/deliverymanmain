"use client";
import { useState, useEffect } from "react";
import { auth } from "../../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "../../loading/page";
import "bootstrap/dist/css/bootstrap.min.css";

// Reusing icons from signup/login styles if available, or just standard SVGs
const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

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
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

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

            // 2. Setup Recaptcha (Clear and recreate container to avoid rendering errors)
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) {}
                window.recaptchaVerifier = null;
            }
            
            const parent = document.getElementById('recaptcha-container-parent');
            if (parent) {
                parent.innerHTML = '<div id="recaptcha-container"></div>';
            }

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            });

            // 3. Send OTP via Firebase
            const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            setConfirmationResult(result);
            setStep(2);
            setTimer(30);
            setCanResend(false);

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
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f7f7eb", padding: "20px" }}>
            {isLoading && <Loading />}
            <div id="recaptcha-container-parent"><div id="recaptcha-container"></div></div>

            <div style={{ backgroundColor: "white", padding: "40px 30px", borderRadius: "25px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px", position: "relative" }}>
                
                {/* Back Button */}
                <button 
                    onClick={() => window.location.href = "/"}
                    style={{
                        position: "fixed",
                        top: "20px",
                        left: "20px",
                        backgroundColor: "white",
                        border: "none",
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        zIndex: "1001"
                    }}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>

                <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "24px", color: "#333" }}>
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Enter OTP"}
                    {step === 3 && "Reset Password"}
                </h2>

                {error && <div className="alert alert-danger" style={{ fontSize: "14px", padding: "10px" }}>{error}</div>}

                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
                            Enter your registered mobile number to receive an OTP.
                        </p>
                        <div style={{ position: "relative", marginBottom: "20px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }}><PhoneIcon /></span>
                            <input
                                type="tel"
                                placeholder="Mobile Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
                                required
                            />
                        </div>
                        <button type="submit" style={btnStyle}>Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
                            OTP sent to +91 {phone}
                        </p>
                        <div style={{ marginBottom: "20px" }}>
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "20px", textAlign: "center", letterSpacing: "4px" }}
                                required
                            />
                        </div>
                        <button type="submit" style={btnStyle}>Verify OTP</button>
                        
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            {!canResend ? (
                                <p style={{ color: '#666', fontSize: '14px' }}>Resend OTP in {timer}s</p>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={handleSendOtp} 
                                    style={{ background: 'none', border: 'none', color: '#ff4d4d', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    Resend OTP
                                </button>
                            )}
                        </div>
                        
                        <button type="button" onClick={() => setStep(1)} style={linkBtnStyle}>Change Number</button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <p style={{ color: "#666", fontSize: "14px", textAlign: "center", marginBottom: "20px" }}>
                            Enter your new password below.
                        </p>
                        <div style={{ position: "relative", marginBottom: "15px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }}><LockIcon /></span>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
                                required
                            />
                        </div>
                        <div style={{ position: "relative", marginBottom: "25px" }}>
                            <span style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }}><LockIcon /></span>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
                                required
                            />
                        </div>
                        <button type="submit" style={btnStyle}>Update Password</button>
                    </form>
                )}


            </div>
        </div>
    );
}

const btnStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#E74C3C", // Red used in login page
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s"
};

const linkBtnStyle = {
    background: "none",
    border: "none",
    color: "#0984e3",
    textDecoration: "underline",
    cursor: "pointer",
    width: "100%",
    marginTop: "15px",
    fontSize: "14px"
};
