import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
      });

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      console.error("Register error", err);

      if (err.response) {
        alert(err.response.data?.message || err.response.statusText || "Request failed");
      } else {
        alert(`Network Error. Make sure backend is running on port 5000\n\n${err.message}`);
      }
    }
  };

  return (
    <div className="immersive-page auth-shell">
      <section
        className="auth-story"
        style={{
          background:
            "linear-gradient(145deg, rgba(20, 60, 88, 0.95) 0%, rgba(14, 116, 144, 0.92) 50%, rgba(249, 115, 22, 0.78) 100%), url('https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80') center/cover no-repeat",
        }}
      >
        <div className="animated-grid" />
        <p className="story-tag">Patient Onboarding</p>
        <h1 className="story-title">Create your health account.</h1>
        <p className="story-copy">
          Start booking appointments, exploring doctors, and following every
          update from one beautifully simple dashboard.
        </p>

        <div className="auth-chip-row">
          <div className="auth-chip">Easy patient registration</div>
          <div className="auth-chip">Status updates in one view</div>
          <div className="auth-chip">Fast doctor discovery</div>
        </div>
      </section>

      <section className="auth-form-zone">
        <div className="animated-grid" />
        <div className="auth-form-card">
          <p style={styles.eyebrow}>Create Account</p>
          <h2 style={styles.title}>Join the Online Doctor Appointment Portal</h2>
          <p style={styles.subtitle}>
            Register as a patient to book doctors and track your appointments.
          </p>

          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            style={styles.input}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleRegister}>
            Register
          </button>

          <div style={styles.footer}>
            <span style={styles.footerText}>Already have an account?</span>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;

const styles = {
  eyebrow: {
    margin: "0 0 8px",
    color: "#0f766e",
    fontWeight: "700",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "32px",
    color: "#173247",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#5c7487",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    marginBottom: "14px",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid #d3e0e8",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.92)",
  },
  button: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "15px 18px",
    background: "linear-gradient(135deg, #0f766e 0%, #0e7490 100%)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 18px 34px rgba(14, 116, 144, 0.22)",
  },
  footer: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  footerText: {
    color: "#5c7487",
  },
  link: {
    color: "#0e7490",
    textDecoration: "none",
    fontWeight: "700",
  },
};
