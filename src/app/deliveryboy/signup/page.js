"use client";
import { useState } from "react";
import { storage, auth } from "../../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import imageCompression from 'browser-image-compression';
import Loading from "../../loading/page";

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

  // NEW state for OTP sending button only (prevents full screen loader blocking ReCaptcha)
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
    setErrorMessage(""); // Clear previous errors

    // Bank Details Validation
    if (!form.accountNumber || !form.confirmAccountNumber || !form.ifscCode) {
      alert("Please fill in all bank details (Account Number & IFSC).");
      return;
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      alert("Account numbers do not match! Please check and try again.");
      return;
    }

    // Phone validation: Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const formattedPhone = "+91" + form.phone;

    setIsSendingOtp(true); // Use local state, NOT global isSubmitting
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal', // Changed to 'normal' (visible) for better reliability during debugging
        'callback': (response) => {
          // reCAPTCHA solved
          console.log("Recaptcha solved:", response);
        },
        'expired-callback': () => {
          console.log("Recaptcha expired");
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

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
      }

      if (error.code === 'auth/captcha-check-failed') {
        const hostname = window.location.hostname;
        msg = `HOSTNAME ERROR: Your current hostname "${hostname}" is not allowed. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add "${hostname}".`;
      } else if (error.code === 'auth/invalid-phone-number') {
        msg = "The phone number is invalid. Format should be +919876543210";
      } else if (error.code === 'auth/invalid-app-credential') {
        msg = "Configuration Error: Phone Auth not enabled or API Key restricted. Check Firebase Console.";
      } else if (error.message && error.message.includes("restricted")) {
        msg = "This API key is restricted. Please check Google Cloud Console credentials restrictions.";
      }

      setErrorMessage(msg);
      alert(msg);

    } finally {
      setIsSendingOtp(false); // Reset local state
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
        // Disable web worker to avoid issues in some environments
        const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: false, initialQuality: 0.5 };
        let compressedFile = file;
        try {
          compressedFile = await imageCompression(file, options);
        } catch (err) {
          console.error("Compression error for " + key, err);
          // Fallback to original file if compression fails
        }

        const storageRef = ref(storage, `delivery_docs/${form.phone.trim()}/${key}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadResults[key] = url;
      }

      // API CALL TO MONGODB
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
    <div style={{ maxWidth: 350, margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      {isSubmitting && <Loading />}
      <div id="recaptcha-container"></div>

      {errorMessage && (
        <div style={{ padding: "15px", background: "#ffebee", border: "1px solid #f44336", color: "#d32f2f", borderRadius: "5px", marginBottom: "20px", fontSize: "14px", fontWeight: "bold" }}>
          {errorMessage}
        </div>
      )}

      <h2>Delivery Boy Signup</h2>

      {!isOtpSent ? (
        <form onSubmit={sendOtp}>
          <input name="name" placeholder="Name" onChange={handleChange} style={inputStyle} required />

          <div style={inputGroupStyle}>
            <input
              name="email"
              placeholder="Email"
              value={form.email.replace("@gmail.com", "")}
              onChange={(e) => setForm({ ...form, email: e.target.value + "@gmail.com" })}
              style={groupInputStyle}
              required
            />
            <span style={suffixStyle}>@gmail.com</span>
          </div>

          <div style={inputGroupStyle}>
            <span style={prefixStyle}>+91</span>
            <input
              name="phone"
              type="tel"
              placeholder="Mobile Number"
              value={form.phone}
              maxLength="10"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm({ ...form, phone: val });
              }}
              style={groupInputStyle}
              required
            />
          </div>

          <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />

          <div style={{ margin: "15px 0" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 10px", color: "#333" }}>Bank Details</h3>
            <input
              name="accountNumber"
              type="text"
              placeholder="Account Number"
              onChange={handleChange}
              style={inputStyle}
              required
            />
            <input
              name="confirmAccountNumber"
              type="text"
              placeholder="Re-enter Account Number"
              onChange={handleChange}
              onPaste={(e) => e.preventDefault()} // Prevent pasting to ensure manual verification
              style={inputStyle}
              required
            />
            <input
              name="ifscCode"
              placeholder="IFSC Code"
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
              style={inputStyle}
              maxLength="11"
              required
            />
          </div>

          {[
            { label: "Aadhar Card", field: "aadharUrl", nameField: "aadharNumber" },
            { label: "RC Book", field: "rcUrl", nameField: "rcNumber" },
            { label: "Driving License", field: "licenseUrl", nameField: "licenseNumber" }
          ].map((item) => (
            <div key={item.field} style={uploadBox}>
              <label style={{ fontSize: "14px", fontWeight: "bold" }}>{item.label}:</label>

              <input
                name={item.nameField}
                placeholder={`Number on ${item.label}`}
                onChange={handleChange}
                style={{ ...inputStyle, marginTop: "5px" }}
                required
              />

              <input
                type="file" accept="image/*" capture="environment"
                onChange={(e) => handleFileChange(e, item.field)}
                style={{ display: "block", marginTop: "5px" }}
              />
            </div>
          ))}
          <button type="submit" style={btnStyle} disabled={isSendingOtp}>
            {isSendingOtp ? "Sending OTP..." : "Send OTP to Register"}
          </button>
        </form>
      ) : (
        <div style={uploadBox}>
          <label>Enter 6-digit OTP sent to {form.phone}</label>
          <input
            type="text"
            placeholder="000000"
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleSubmit} style={btnStyle} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Verify OTP & Complete Signup"}
          </button>
          <button onClick={() => setIsOtpSent(false)} style={{ ...btnStyle, background: "#ccc", marginTop: "10px" }}>
            Edit Phone Number
          </button>
        </div>
      )}

      <div style={{ marginTop: "30px", fontSize: "12px", color: "#666", textAlign: "center" }}>
        <p>Debug Info:</p>
        <p>Hostname: <strong suppressHydrationWarning>{typeof window !== 'undefined' ? window.location.hostname : 'loading...'}</strong></p>
        <p>Ensure this hostname is added to Firebase Console &gt; Auth &gt; Settings &gt; Authorized Domains</p>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const inputGroupStyle = { display: "flex", alignItems: "center", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", overflow: "hidden" };
const prefixStyle = { background: "#eee", padding: "10px 10px", borderRight: "1px solid #ccc", color: "#555", fontWeight: "bold", whiteSpace: "nowrap" };
const suffixStyle = { background: "#eee", padding: "10px 10px", borderLeft: "1px solid #ccc", color: "#555", fontWeight: "bold", whiteSpace: "nowrap", fontSize: "14px" };
const groupInputStyle = { flex: 1, padding: "10px", border: "none", outline: "none", minWidth: 0 };

const uploadBox = { marginBottom: "15px", padding: "12px", background: "#fefefe", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const btnStyle = { width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };