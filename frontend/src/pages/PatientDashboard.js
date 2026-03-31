import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { getStoredUser } from "../services/session";

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const user = getStoredUser();

  const loadAppointments = useCallback(() => {
    api.get(`/appointments/${user.id}`)
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    loadAppointments();
    api.get(`/notifications/${user.id}`)
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [loadAppointments, user?.id]);

  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/cancel/${id}`);
      alert("Appointment Cancelled");
      loadAppointments();
    } catch (err) {
      alert("Error cancelling appointment");
    }
  };

  const pendingCount = appointments.filter((item) => item.status === "Pending").length;
  const acceptedCount = appointments.filter((item) => item.status === "Accepted").length;
  const rejectedCount = appointments.filter((item) => item.status === "Rejected").length;
  const unreadNotifications = notifications.filter((item) => !item.is_read).length;

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <p style={styles.tag}>Patient Dashboard</p>
            <h1 style={styles.heading}>Everything about your appointments, beautifully organized.</h1>
            <p style={styles.copy}>
              Browse doctors, monitor approval status, and manage pending bookings
              from one calm, modern view.
            </p>
          </div>

          <div style={styles.glassCard}>
            <span style={styles.glassLabel}>Welcome back</span>
            <strong style={styles.glassTitle}>{user?.name || "Patient"}</strong>
            <p style={styles.glassText}>Your care journey is easier when every booking and update stays visible in one place.</p>
            <div style={styles.notificationPill}>
              <strong>{unreadNotifications}</strong>
              <span> unread notifications</span>
            </div>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <MetricCard label="Total" value={appointments.length} tone="sky" />
          <MetricCard label="Pending" value={pendingCount} tone="amber" />
          <MetricCard label="Accepted" value={acceptedCount} tone="green" />
          <MetricCard label="Rejected" value={rejectedCount} tone="red" />
        </section>

        <section style={styles.tableCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.smallTag}>Recent Activity</p>
              <h2 style={styles.sectionTitle}>My appointments</h2>
            </div>
          </div>

          <table border="1" cellPadding="12" style={styles.table}>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span style={{ ...styles.badge, ...badgeColors[appointment.status] }}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      {appointment.status === "Pending" ? (
                        <button onClick={() => cancelAppointment(appointment.id)} style={styles.cancelButton}>
                          Cancel
                        </button>
                      ) : (
                        <span style={styles.lockedText}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    No appointments yet. Visit the Doctors page to book one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}

function MetricCard({ label, value, tone }) {
  const toneStyles = {
    sky: { background: "linear-gradient(135deg, #e6f7ff 0%, #cfeeff 100%)", color: "#0e7490" },
    amber: { background: "linear-gradient(135deg, #fff5db 0%, #ffe5b5 100%)", color: "#b45309" },
    green: { background: "linear-gradient(135deg, #e4fff2 0%, #cbf7df 100%)", color: "#15803d" },
    red: { background: "linear-gradient(135deg, #fff0f1 0%, #ffd9dd 100%)", color: "#be123c" },
  };

  return (
    <div style={{ ...styles.metricCard, ...toneStyles[tone] }}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  );
}

export default PatientDashboard;

const badgeColors = {
  Pending: { background: "#fff3cd", color: "#8a5a00" },
  Accepted: { background: "#d1fae5", color: "#065f46" },
  Rejected: { background: "#fee2e2", color: "#991b1b" },
};

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  hero: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" },
  heroPanel: {
    padding: "34px",
    borderRadius: "30px",
    color: "#fff",
    background: "linear-gradient(135deg, rgba(15,118,110,0.96) 0%, rgba(14,116,144,0.95) 56%, rgba(18,52,71,0.96) 100%)",
    boxShadow: "0 28px 64px rgba(15, 50, 80, 0.14)",
  },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", opacity: 0.9 },
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  glassCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 24px 54px rgba(15, 50, 80, 0.1)",
  },
  glassLabel: { display: "block", color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  glassTitle: { display: "block", marginTop: "12px", color: "#173247", fontSize: "28px" },
  glassText: { margin: "12px 0 0", color: "#5b7282", lineHeight: 1.65 },
  notificationPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "16px",
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0e7490",
    fontWeight: "700",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "18px" },
  metricCard: { borderRadius: "24px", padding: "22px", boxShadow: "0 16px 40px rgba(15, 50, 80, 0.08)" },
  metricLabel: { display: "block", fontWeight: "700", fontSize: "14px" },
  metricValue: { display: "block", fontSize: "40px", marginTop: "10px" },
  tableCard: {
    background: "rgba(255,255,255,0.86)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 20px 48px rgba(15, 50, 80, 0.08)",
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  smallTag: { margin: 0, color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  sectionTitle: { margin: "8px 0 0", color: "#173247", fontSize: "30px" },
  table: { width: "100%", borderCollapse: "collapse" },
  badge: { display: "inline-block", padding: "7px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "13px" },
  cancelButton: { border: "none", borderRadius: "12px", padding: "9px 14px", background: "#dc2626", color: "#fff", cursor: "pointer" },
  lockedText: { color: "#7b8b96" },
};
