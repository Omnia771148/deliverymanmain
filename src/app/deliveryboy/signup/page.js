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
    aadharNumber: "", rcNumber: "", licenseNumber: ""
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
    if (!form.phone.startsWith("+")) {
      alert("Please enter phone number with country code (e.g., +919876543210)");
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
          'expired-callback': () => {
            // Response expired. Ask user to solve reCAPTCHA again.
            if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        });
      }

      const result = await signInWithPhoneNumber(auth, form.phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert("OTP sent to your phone!");
    } catch (error) {
      console.error("OTP Error:", error);
      // Only clear if it was a specific error, otherwise keep it to avoid "already rendered"
      if (window.recaptchaVerifier && (error.code === 'auth/invalid-app-credential' || error.code === 'auth/captcha-check-failed')) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        document.getElementById('recaptcha-container').innerHTML = '';
      }
      alert("Failed to send OTP: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

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
        const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, initialQuality: 0.5 };
        const compressedFile = await imageCompression(file, options);

        const storageRef = ref(storage, `delivery_docs/${form.phone}/${key}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        uploadResults[key] = url;
      }

      // API CALL TO MONGODB
      const finalFormData = { ...form, ...uploadResults, firebaseUid: firebaseUser.uid };
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

      <h2>Delivery Boy Signup</h2>

      {!isOtpSent ? (
        <form onSubmit={sendOtp}>
          <input name="name" placeholder="Name" onChange={handleChange} style={inputStyle} required />
          <input name="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
          <input name="phone" placeholder="Phone (with +91)" onChange={handleChange} style={inputStyle} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />

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
          <button type="submit" style={btnStyle}>Send OTP to Register</button>
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
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const uploadBox = { marginBottom: "15px", padding: "12px", background: "#fefefe", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const btnStyle = { width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };