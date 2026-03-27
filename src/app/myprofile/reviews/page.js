"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../../loading/page";
import AuthWrapper from "../../components/AuthWrapper";
import styles from "./reviews.module.css";

export default function MyReviews() {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const deliveryBoyId = localStorage.getItem("userId");
                if (!deliveryBoyId) {
                    router.push("/deliveryboy/login");
                    return;
                }

                const res = await fetch(`/api/myreviews?deliveryBoyId=${deliveryBoyId}`);
                const data = await res.json();

                if (data.success) {
                    setReviews(data.data);
                }
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                // Keep loading for at least 500ms for consistent UI feel
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchReviews();
    }, [router]);

    if (loading) return <Loading />;

    return (
        <AuthWrapper>
            <div className={styles.pageContainer}>
            <div className={styles.headerSection}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <i className="bi bi-chevron-left"></i>
                </button>

                <div className={styles.titlePill}>
                    <i className="bi bi-star-fill"></i>
                    <span>My Reviews</span>
                </div>
            </div>

            <div className={styles.reviewsContainer}>
                {reviews.length === 0 ? (
                    <div className={styles.noReviews}>
                        <i className="bi bi-chat-square-dots"></i>
                        <p>No reviews found yet.</p>
                    </div>
                ) : (
                    reviews.map((review, index) => (
                        <div key={review._id || index} className={styles.reviewCard}>
                            <div className={styles.reviewInner}>
                                <div className={styles.orderIdSection}>
                                    Order ID: {review.orderId || "N/A"}
                                </div>

                                <div className={styles.ratingSection}>
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className={`bi ${i < (review.deliveryBoyRating || 0) ? 'bi-star-fill' : 'bi-star'} ${styles.starIcon}`}
                                        ></i>
                                    ))}
                                    <span className={styles.ratingValue}>{review.deliveryBoyRating || 0}</span>
                                </div>

                                <div className={styles.reviewText}>
                                    {review.deliveryBoyReview ? `"${review.deliveryBoyReview}"` : "no comments are available"}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </AuthWrapper>
    );
}
