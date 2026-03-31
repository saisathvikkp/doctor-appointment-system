import React from "react";

function DoctorCard({ doc }) {
  return (
    <div style={styles.card}>
      <img src={doc.image} alt={doc.name} style={styles.image} />
      <div style={styles.content}>
        <h3 style={styles.name}>{doc.name}</h3>
        <p style={styles.specialization}>{doc.specialization}</p>
        <button style={styles.button}>Available</button>
      </div>
    </div>
  );
}

export default DoctorCard;

const styles = {
  card: {
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 18px 40px rgba(20, 50, 80, 0.08)",
  },
  image: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
    display: "block",
  },
  content: {
    padding: "18px 18px 22px",
  },
  name: {
    margin: "0 0 8px",
    color: "#173247",
  },
  specialization: {
    margin: "0 0 16px",
    color: "#5c7487",
  },
  button: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#0e7490",
    color: "#fff",
    fontWeight: "700",
  },
};
