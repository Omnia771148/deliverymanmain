"use client";
import { useState } from "react";
import { storage } from "../../../../lib/firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from 'browser-image-compression';
import Loading from "../../loading/page";  // Import your pizza loading component

export default function DeliveryBoySignup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: ""
  });
  
  // NEW: State to hold the actual file objects locally
  const [selectedFiles, setSelectedFiles] = useState({
    aadharUrl: null,
    rcUrl: null,
    licenseUrl: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Just store the file in state (don't upload yet)
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 2. Upload all 3 files at once during Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all files are selected
    if (!selectedFiles.aadharUrl || !selectedFiles.rcUrl || !selectedFiles.licenseUrl) {
      alert("Please select all 3 photos first!");
      return;
    }

    setIsSubmitting(true); // Show Pizza Loading

    try {
      const uploadResults = {};
      const fileKeys = ["aadharUrl", "rcUrl", "licenseUrl"];

      // Process and Upload each file
      for (const key of fileKeys) {
        const file = selectedFiles[key];
        
        // Compress
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.5,
        };
        const compressedFile = await imageCompression(file, options);

        // Upload to Firebase
        const storageRef = ref(storage, `delivery_docs/${form.phone || "unknown"}/${key}`);
        await uploadBytes(storageRef, compressedFile);
        const url = await getDownloadURL(storageRef);
        
        uploadResults[key] = url; // Save URL for the API call
      }

      // 3. Send data to your API with the Firebase URLs
      const finalFormData = { ...form, ...uploadResults };
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
      console.error("Signup error:", error);
      alert("Error during upload or signup.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      {isSubmitting && <Loading />}

      <h2>Delivery Boy Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} style={inputStyle} required />
        <input name="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} style={inputStyle} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />
        
        {[ 
          { label: "Aadhar Card", field: "aadharUrl" },
          { label: "RC Book", field: "rcUrl" },
          { label: "Driving License", field: "licenseUrl" }
        ].map((item) => (
          <div key={item.field} style={uploadBox}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>{item.label}:</label>
            <input 
              type="file" accept="image/*" capture="environment" 
              onChange={(e) => handleFileChange(e, item.field)} 
              style={{ display: "block", marginTop: "5px" }}
            />
            {selectedFiles[item.field] && (
              <span style={{ color: "blue", fontSize: "12px" }}>📍 File Selected</span>
            )}
          </div>
        ))}

        <button type="submit" style={btnStyle} disabled={isSubmitting}>
          {isSubmitting ? "Uploading & Saving..." : "Signup"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" };
const uploadBox = { marginBottom: "15px", padding: "12px", background: "#fefefe", borderRadius: "8px", border: "1px solid #eee", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
const btnStyle = { width: "100%", padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };