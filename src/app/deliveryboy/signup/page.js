"use client";
import { useState } from "react";
import { storage, auth } from "../../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import imageCompression from 'browser-image-compression';
import Loading from "../../loading/page";
import 'bootstrap/dist/css/bootstrap.min.css';
import './signup.css';

// SVG Icons
const UserIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="#aaa">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="#aaa">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const MailIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="#aaa">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="#aaa">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);
const BankIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 10h16v2H4zm-2 9h20v3H2zm6-9v5H5v-5zm6 0v5h-3v-5zm6 0v5h-3v-5zM12 1L2 6v2h20V6z" />
  </svg>
);
const ProofIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

export default function DeliveryBoySignup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    aadharNumber: "", rcNumber: "", licenseNumber: "",
    accountNumber: "", confirmAccountNumber: "", ifscCode: ""
  });

  const [selectedFiles, setSelectedFiles] = useState({
    aadharUrl: null,
    rcUrl: null,
    licenseUrl: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const sendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Bank Details Validation
    if (!form.accountNumber || !form.confirmAccountNumber || !form.ifscCode) {
      alert("Please fill in all bank details (Account Number & IFSC).");
      return;
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      alert("Account numbers do not match! Please check and try again.");
      return;
    }

    // Phone validation
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const formattedPhone = "+91" + form.phone;

    setIsSendingOtp(true);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log("Recaptcha solved:", response);
        },
        'expired-callback': () => {
          if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      });

      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert("OTP sent to your phone! Check your SMS.");
    } catch (error) {
      console.error("OTP Error:", error);
      let msg = "Failed to send OTP: " + (error.message || "Unknown error");
      if (error.code === 'auth/captcha-check-failed') {
        // Handle specifics if needed
      }
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!selectedFiles.aadharUrl || !selectedFiles.rcUrl || !selectedFiles.licenseUrl) {
      alert("Please select all 3 photos!");
      return;
    }

    if (!form.aadharNumber || !form.rcNumber || !form.licenseNumber) {
      alert("Please enter numbers for all 3 documents!");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const uploadResults = {};
      const fileKeys = ["aadharUrl", "rcUrl", "licenseUrl"];

      for (const key of fileKeys) {
        const file = selectedFiles[key];
        const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: false, initialQuality: 0.5 };
        let compressedFile = file;
        try {
          compressedFile = await imageCompression(file, options);
        } catch (err) {
          console.error("Compression error for " + key, err);
        }
        const storageRef = ref(storage, `delivery_docs/${form.phone.trim()}/${key}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadResults[key] = url;
      }

      const finalFormData = { ...form, ...uploadResults, firebaseUid: firebaseUser.uid, phone: "+91" + form.phone };
      const res = await fetch("/api/deliveryboy/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.href = "/deliveryboy/login";
      } else {
        alert(data.message || "Signup failed");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Verification/Signup error:", error);
      alert("Invalid OTP or Registration failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page-container">
      {isSubmitting && <Loading />}
      <div id="recaptcha-container"></div>

      <div className="signup-form-wrapper">
        <div className="welcome-header">
          <h1 className="welcome-title">Welcome</h1>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={sendOtp}>
            <div className="custom-input-group">
              <UserIcon />
              <input
                name="name"
                placeholder="Delivery partner name"
                onChange={handleChange}
                className="custom-input"
                required
              />
            </div>

            <div className="custom-input-group">
              <PhoneIcon />
              <input
                name="phone"
                type="tel"
                placeholder="Delivery partner phone number"
                value={form.phone}
                maxLength="10"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: val });
                }}
                className="custom-input"
                required
              />
            </div>

            <div className="custom-input-group">
              <MailIcon />
              <input
                name="email"
                placeholder="Delivery partner Mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="custom-input"
                required
              />
            </div>

            <div className="custom-input-group">
              <LockIcon />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="custom-input"
                required
              />
            </div>

            {/* Bank Details Section */}
            <div className="section-divider">
              <div className="section-label">
                <BankIcon /> Bank details
              </div>
            </div>

            <div className="custom-input-group">
              <input
                name="accountNumber"
                type="text"
                placeholder="Enter your account number"
                onChange={handleChange}
                className="custom-input"
                style={{ paddingLeft: '20px', textAlign: 'center' }} // Center text as per pill design often implies centered or standard left. Image shows left aligned placeholder.
                required
              />
            </div>
            <div className="custom-input-group">
              <input
                name="confirmAccountNumber"
                type="text"
                placeholder="Confirm your account number"
                onChange={handleChange}
                onPaste={(e) => e.preventDefault()}
                className="custom-input"
                style={{ paddingLeft: '20px', textAlign: 'center' }}
                required
              />
            </div>
            <div className="custom-input-group">
              <input
                name="ifscCode"
                placeholder="IFSC Code"
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                className="custom-input"
                style={{ paddingLeft: '20px', textAlign: 'center' }}
                maxLength="11"
                required
              />
            </div>

            {/* Proofs Section */}
            <div className="section-divider">
              <div className="section-label">
                <ProofIcon /> Proofs
              </div>
            </div>

            {[
              { label: "Aadhar card :", field: "aadharUrl", nameField: "aadharNumber", ph: "Enter your Aadhar card number" },
              { label: "Driving license :", field: "licenseUrl", nameField: "licenseNumber", ph: "Enter your Driving license number" },
              { label: "RC number :", field: "rcUrl", nameField: "rcNumber", ph: "Enter your RC number" }
            ].map((item) => (
              <div key={item.field} className="mb-3">
                <label className="upload-label">{item.label}</label>
                <div className="upload-card">
                  <input
                    name={item.nameField}
                    placeholder={item.ph}
                    onChange={handleChange}
                    className="upload-input-field"
                    required
                  />
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => handleFileChange(e, item.field)}
                    className="form-control" // Bootstrap class for file input looks okay, or custom
                    style={{ borderRadius: '50px' }}
                  />
                </div>
              </div>
            ))}

            <button type="submit" className="signup-btn" disabled={isSendingOtp}>
              {isSendingOtp ? "Sending OTP..." : "Sign up"}
            </button>
          </form>
        ) : (
          <div className="signup-form-wrapper" style={{ textAlign: 'center', background: 'white', padding: '30px', borderRadius: '20px' }}>
            <h3>Enter OTP</h3>
            <p>Sent to +91 {form.phone}</p>
            <input
              type="text"
              placeholder="000000"
              onChange={(e) => setOtp(e.target.value)}
              className="custom-input"
              style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '20px' }}
            />
            <button onClick={handleSubmit} className="signup-btn" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify & Register"}
            </button>
            <button onClick={() => setIsOtpSent(false)} className="btn btn-link mt-3" style={{ color: '#666' }}>
              Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
