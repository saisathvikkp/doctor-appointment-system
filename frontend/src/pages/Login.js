import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveSession } from "../services/session";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("patient");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      if (res.data.message === "Login Successful") {
        saveSession(res.data.user, res.data.token);

        if (res.data.user.role === "doctor") {
          navigate("/doctor-dashboard");
          return;
        }

        if (res.data.user.role === "admin") {
          navigate("/admin-dashboard");
          return;
        }

        navigate("/dashboard");
        return;
      }

      alert("Invalid Login");
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || "Login Error");
      } else {
        alert("Network Error. Make sure the backend is running on port 5000.");
      }
    }
  };

  return (
    <div className="immersive-page auth-shell">
      <section className="auth-story">
        <div className="animated-grid" />
        <p className="story-tag">Care That Moves</p>
        <h1 className="story-title">Welcome</h1>
        <p className="story-copy">
          Online Doctor Appointment with a warmer, more modern experience for
          patients and doctors.
        </p>

        <div className="auth-chip-row">
          <div className="auth-chip">Find specialists fast</div>
          <div className="auth-chip">Track live appointment status</div>
          <div className="auth-chip">Doctor daily schedule view</div>
        </div>
      </section>

      <section className="auth-form-zone">
        <div className="animated-grid" />
        <div className="auth-form-card">
          <Link to="/" style={styles.backLink}>
            Back to Home
          </Link>

          <h3 style={styles.title}>Sign In</h3>
          <p style={styles.subtitle}>Online Doctor Appointment</p>

          <div style={styles.modeSwitch}>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(loginMode === "patient" ? styles.modeButtonActive : {}),
              }}
              onClick={() => setLoginMode("patient")}
            >
              Patient Login
            </button>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(loginMode === "doctor" ? styles.modeButtonActive : {}),
              }}
              onClick={() => setLoginMode("doctor")}
            >
              Doctor Login
            </button>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...styles.adminModeButton,
                ...(loginMode === "admin" ? styles.modeButtonActive : {}),
              }}
              onClick={() => setLoginMode("admin")}
            >
              Admin Login
            </button>
          </div>

          <input
            style={styles.input}
            placeholder={
              loginMode === "doctor"
                ? "Doctor Email"
                : loginMode === "admin"
                  ? "Admin Email"
                  : "Email"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            style={styles.input}
            placeholder={
              loginMode === "doctor"
                ? "Doctor Password"
                : loginMode === "admin"
                  ? "Admin Password"
                  : "Password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            {loginMode === "doctor"
              ? "Login as Doctor"
              : loginMode === "admin"
                ? "Login as Admin"
                : "Login"}
          </button>

          <div style={styles.adminBox}>
            <div>
              <strong style={styles.adminTitle}>Admin Access</strong>
              <p style={styles.adminText}>
                Use the admin login tab to access the management workspace with your secure credentials.
              </p>
            </div>
          </div>

          <div style={styles.footer}>
            <span style={styles.footerText}>New here?</span>
            <Link to="/register" style={styles.link}>
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;

const styles = {
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    marginBottom: "18px",
    color: "#0e7490",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "40px",
    color: "#173247",
    lineHeight: 1.2,
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#5c7487",
    lineHeight: 1.5,
    textAlign: "center",
    fontSize: "18px",
  },
  modeSwitch: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "18px",
  },
  modeButton: {
    border: "1px solid #d3e0e8",
    borderRadius: "14px",
    padding: "12px 14px",
    background: "#f8fbfd",
    color: "#355468",
    fontWeight: "700",
    cursor: "pointer",
  },
  adminModeButton: {
    background: "#fff7ed",
    borderColor: "#fed7aa",
    color: "#9a3412",
  },
  modeButtonActive: {
    background: "linear-gradient(135deg, #0f766e 0%, #0e7490 100%)",
    color: "#fff",
    borderColor: "#0e7490",
    boxShadow: "0 14px 28px rgba(14, 116, 144, 0.2)",
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
  adminBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "18px",
    background: "#fff8f2",
    border: "1px solid #fde1c3",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  adminTitle: {
    display: "block",
    color: "#9a3412",
    marginBottom: "4px",
  },
  adminText: {
    margin: 0,
    color: "#7c5a43",
    fontSize: "13px",
    lineHeight: 1.6,
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
