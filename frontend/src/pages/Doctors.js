import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctor1 from "../assets/doctor1.jpg";
import doctor2 from "../assets/doctor2.jpg";
import doctor3 from "../assets/doctor3.jpg";
import Layout from "../components/Layout";
import api from "../services/api";

const doctorPhotoMap = {
  "Dr. John Smith": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80",
  "Dr. Sarah Johnson": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
  "Dr. Michael Brown": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=900&q=80",
  "Dr. Emily Davis": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
  "Dr. Robert Wilson": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=80",
};

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const doctorImages = [doctor1, doctor2, doctor3];

  useEffect(() => {
    api.get("/doctors")
      .then((res) => {
        setDoctors(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <p style={styles.tag}>Find Specialists</p>
          <h1 style={styles.heading}>Choose the doctor that fits your care journey.</h1>
          <p style={styles.copy}>
            Explore specialists, compare profiles, and move straight into booking.
          </p>
        </section>

        <section style={styles.grid}>
          {doctors.map((doc, index) => (
            <div style={styles.card} key={doc.id}>
              <img
                src={doctorPhotoMap[doc.name] || doctorImages[index % doctorImages.length]}
                alt={doc.name}
                style={styles.image}
              />
              <div style={styles.cardBody}>
                <p style={styles.cardTag}>Specialist</p>
                <h3 style={styles.cardName}>{doc.name}</h3>
                <p style={styles.cardSpecialization}>{doc.specialization}</p>
                <div style={styles.ratingRow}>
                  <span style={styles.ratingStars}>
                    {doc.review_count > 0 ? "★".repeat(Math.round(doc.average_rating || 0)) : "No ratings yet"}
                  </span>
                  {doc.review_count > 0 && (
                    <span style={styles.ratingText}>
                      {doc.average_rating}/5 ({doc.review_count} reviews)
                    </span>
                  )}
                </div>
                <p style={styles.cardExperience}>{doc.experience}</p>
                <div style={styles.infoStack}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Clinic</span>
                    <span style={styles.infoValue}>{doc.address || "Address will be shared after booking"}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Fee</span>
                    <span style={styles.infoValue}>Rs. {doc.consultation_fee ?? "N/A"}</span>
                  </div>
                  <div style={styles.paymentNote}>
                    {doc.payment_note || "Pay at clinic after consultation"}
                  </div>
                </div>
                <button style={styles.bookButton} onClick={() => navigate(`/book/${doc.id}`)}>
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
}

export default Doctors;

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  hero: {
    padding: "34px",
    borderRadius: "30px",
    color: "#fff",
    background: "linear-gradient(135deg, rgba(15,118,110,0.96) 0%, rgba(14,116,144,0.94) 55%, rgba(18,52,71,0.95) 100%)",
    boxShadow: "0 28px 64px rgba(15, 50, 80, 0.14)",
  },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", opacity: 0.9 },
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "22px" },
  card: {
    overflow: "hidden",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 20px 48px rgba(15, 50, 80, 0.08)",
    backdropFilter: "blur(14px)",
  },
  image: { width: "100%", height: "250px", objectFit: "cover", display: "block" },
  cardBody: { padding: "22px" },
  cardTag: { margin: 0, color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  cardName: { margin: "10px 0 8px", color: "#173247", fontSize: "28px" },
  cardSpecialization: { margin: "0 0 8px", color: "#5c7487" },
  ratingRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "10px" },
  ratingStars: { color: "#d97706", fontWeight: "700" },
  ratingText: { color: "#6b7f8d", fontSize: "14px" },
  cardExperience: { margin: "0 0 18px", color: "#355468", fontWeight: "700" },
  infoStack: {
    display: "grid",
    gap: "10px",
    marginBottom: "18px",
    padding: "14px",
    borderRadius: "18px",
    background: "#f4fbfc",
    border: "1px solid #d9eef2",
  },
  infoRow: { display: "grid", gap: "4px" },
  infoLabel: { color: "#0e7490", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" },
  infoValue: { color: "#27485d", lineHeight: 1.5 },
  paymentNote: {
    paddingTop: "6px",
    borderTop: "1px dashed #c5d9df",
    color: "#486475",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  bookButton: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "linear-gradient(135deg, #0f766e 0%, #0e7490 100%)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
