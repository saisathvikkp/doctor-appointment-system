import React from "react";
import { Link } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";

const featuredDoctors = [
  {
    name: "Dr. Smith",
    specialization: "Cardiologist",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dr. John",
    specialization: "Dermatologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dr. Emily",
    specialization: "Pediatrician",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80",
  },
];

const impactStats = [
  { value: "24/7", label: "appointment access" },
  { value: "50+", label: "specialist slots weekly" },
  { value: "1 tap", label: "status tracking" },
];

function Home() {
  return (
    <div className="immersive-page" style={styles.page}>
      <div className="animated-grid" />
      <div className="floating-orb one" />
      <div className="floating-orb two" />
      <div className="floating-orb three" />

      <section style={styles.hero}>
        <div style={styles.heroPanel}>
          <div style={styles.kickerRow}>
            <p style={styles.kicker}>Trusted Care</p>
            <span style={styles.availabilityBadge}>Open for patients and doctors</span>
          </div>
          <h1 style={styles.heading}>Book doctor appointments in one smooth, complete experience.</h1>
          <p style={styles.copy}>
            Start from one welcoming home page, sign in without confusion, and
            move through booking and appointment tracking with clarity.
          </p>

          <div style={styles.actions}>
            <Link to="/login" style={styles.primaryLink}>
              Start Now
            </Link>
            <Link to="/register" style={styles.secondaryLink}>
              Create Account
            </Link>
          </div>

          <div style={styles.statsRow}>
            {impactStats.map((item) => (
              <div key={item.label} style={styles.statCard}>
                <strong style={styles.statValue}>{item.value}</strong>
                <span style={styles.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.highlightsRow}>
            <div style={styles.highlightCard}>
              <strong style={styles.highlightTitle}>Easy first step</strong>
              <span style={styles.highlightText}>Start here, then move to sign in or register.</span>
            </div>
            <div style={styles.highlightCard}>
              <strong style={styles.highlightTitle}>Clear patient flow</strong>
              <span style={styles.highlightText}>Find doctors, book, and track status quickly.</span>
            </div>
          </div>
        </div>

        <div style={styles.visualColumn}>
          <div className="floating-panel doctor">
            <img
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=900&q=80"
              alt="Doctor consulting patient"
            />
            <div className="caption">
              <strong>Compassion-led care</strong>
              <span>Friendly doctors, confident booking.</span>
            </div>
          </div>

          <div className="floating-panel patient">
            <img
              src="https://images.unsplash.com/photo-1576765608866-5b51046452be?auto=format&fit=crop&w=900&q=80"
              alt="Happy patient"
            />
            <div className="caption">
              <strong>Happy patient journeys</strong>
              <span>Simple scheduling and quick updates.</span>
            </div>
          </div>

          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Live Dashboards</span>
            <h3 style={styles.infoTitle}>Patient and doctor views stay focused.</h3>
            <p style={styles.infoText}>
              Patients see doctors, booking, and status. Doctors see requests,
              approvals, and appointments for the day.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.featuredSection}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kickerDark}>Featured Specialists</p>
            <h2 style={styles.sectionTitle}>Doctors you can consult</h2>
          </div>
          <div style={styles.ribbon}>
            <span style={styles.ribbonTitle}>Smart Experience</span>
            <span style={styles.ribbonText}>Animated visuals with a calm healthcare tone.</span>
          </div>
        </div>

        <div style={styles.doctorGrid}>
          {featuredDoctors.map((doctor) => (
            <DoctorCard key={doctor.name} doc={doctor} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

const styles = {
  page: {
    padding: "32px 24px 48px",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #d7efff 0%, #f7fbfd 42%, #fff2e8 100%)",
  },
  hero: {
    maxWidth: "1240px",
    margin: "0 auto 40px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.95fr)",
    gap: "24px",
    alignItems: "stretch",
  },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(15,118,110,0.96) 0%, rgba(14,116,144,0.95) 52%, rgba(18,52,71,0.96) 100%)",
    color: "#fff",
    borderRadius: "34px",
    padding: "52px",
    minHeight: "580px",
    boxShadow: "0 30px 70px rgba(15, 50, 80, 0.18)",
  },
  kickerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  kicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: "700",
    fontSize: "12px",
    opacity: 0.92,
  },
  availabilityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "13px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
  },
  heading: {
    margin: "18px 0 16px",
    fontSize: "clamp(2.7rem, 5vw, 4.2rem)",
    lineHeight: 1.04,
    maxWidth: "720px",
  },
  copy: {
    margin: 0,
    maxWidth: "600px",
    lineHeight: 1.75,
    fontSize: "18px",
    color: "rgba(255,255,255,0.88)",
  },
  actions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "32px",
  },
  primaryLink: {
    textDecoration: "none",
    background: "#fff",
    color: "#0f4c5c",
    padding: "15px 26px",
    borderRadius: "999px",
    fontWeight: "700",
    boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
  },
  secondaryLink: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.14)",
    color: "#fff",
    padding: "15px 26px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.2)",
    fontWeight: "700",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "38px",
  },
  highlightsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  statCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
  },
  statValue: {
    display: "block",
    fontSize: "28px",
  },
  statLabel: {
    display: "block",
    marginTop: "6px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.82)",
  },
  highlightCard: {
    padding: "18px 20px",
    borderRadius: "22px",
    background: "rgba(10, 26, 39, 0.22)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  highlightTitle: {
    display: "block",
    fontSize: "17px",
    fontWeight: "700",
    color: "#fff",
  },
  highlightText: {
    display: "block",
    marginTop: "8px",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.82)",
  },
  visualColumn: {
    position: "relative",
    minHeight: "580px",
  },
  infoCard: {
    position: "absolute",
    inset: "auto 0 0 0",
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(18px)",
    borderRadius: "30px",
    padding: "30px",
    boxShadow: "0 22px 55px rgba(15, 50, 80, 0.12)",
    border: "1px solid rgba(255,255,255,0.68)",
  },
  infoLabel: {
    display: "inline-block",
    color: "#0e7490",
    fontWeight: "700",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  infoTitle: {
    margin: "14px 0 10px",
    color: "#173247",
    fontSize: "30px",
    lineHeight: 1.18,
  },
  infoText: {
    margin: 0,
    color: "#5c7487",
    lineHeight: 1.7,
  },
  featuredSection: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  sectionHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "18px",
    alignItems: "end",
    marginBottom: "22px",
  },
  kickerDark: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
    fontSize: "12px",
    color: "#0e7490",
  },
  sectionTitle: {
    margin: "10px 0 0",
    color: "#173247",
    fontSize: "36px",
  },
  ribbon: {
    padding: "16px 18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: "0 14px 30px rgba(15, 50, 80, 0.08)",
  },
  ribbonTitle: {
    display: "block",
    color: "#173247",
    fontWeight: "700",
  },
  ribbonText: {
    display: "block",
    marginTop: "6px",
    color: "#5c7487",
    fontSize: "14px",
  },
  doctorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "22px",
  },
};
