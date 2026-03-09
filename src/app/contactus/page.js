"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ContactUs() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#FBF8F2", // Light cream page background
            padding: "20px",
            paddingBottom: "100px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Header Area */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginBottom: "40px",
                marginTop: "10px"
            }}>
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        position: "absolute",
                        left: "0",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        cursor: "pointer"
                    }}
                >
                    <i className="bi bi-chevron-left" style={{ fontSize: "20px", fontWeight: "bold" }}></i>
                </button>

                {/* Title Pill */}
                <div style={{
                    backgroundColor: "#fff",
                    padding: "12px 30px",
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    <i className="bi bi-envelope-fill" style={{ fontSize: "24px" }}></i>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Contact Us</h2>
                </div>
            </div>

            {/* Main Content Card */}
            <div style={{
                backgroundColor: "#E6DCC8", // Tan container background
                borderRadius: "40px",
                padding: "25px",
                maxWidth: "450px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                {/* Contact Rows */}
                <ContactItem icon="bi-telephone-fill" text="+91 100" link="tel:+91100" />
                <ContactItem icon="bi-envelope-fill" text="spv@gmail.com" link="mailto:spv@gmail.com" />
                <ContactItem icon="bi-instagram" text="Instagram" link="https://instagram.com" />
                <ContactItem icon="bi-facebook" text="Facebook" link="https://facebook.com" />
                <ContactItem icon="bi-twitter-x" text="Twitter" link="https://twitter.com" />
            </div>

            {/* <BottomNav /> */}
        </div>
    );
}

function ContactItem({ icon, text, link }) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "50px",
                padding: "18px 25px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                transition: "transform 0.2s"
            }}>
                <div style={{ width: "24px", textAlign: "center" }}>
                    <i className={`bi ${icon}`} style={{ fontSize: "22px", color: "#111" }}></i>
                </div>
                <span style={{ fontSize: "18px", fontWeight: "600", color: "#111" }}>{text}</span>
            </div>
        </a>
    );
}
