import React, { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { getStoredUser } from "../services/session";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const user = getStoredUser();

  const loadAppointments = useCallback(async (dateFilter = "") => {
    try {
      const query = dateFilter ? `?date=${dateFilter}` : "";
      const res = await api.get(`/doctor/appointments/${user.id}${query}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    loadAppointments(selectedDate);
  }, [loadAppointments, selectedDate, user?.id]);

  const updateStatus = async (id, status) => {
    try {
      await api.post("/update_status", { appointment_id: id, status });
      loadAppointments(selectedDate);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const pendingCount = appointments.filter((item) => item.status === "Pending").length;
  const acceptedCount = appointments.filter((item) => item.status === "Accepted").length;
  const rejectedCount = appointments.filter((item) => item.status === "Rejected").length;

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <p style={styles.tag}>Doctor Dashboard</p>
            <h1 style={styles.heading}>Review requests and lead the day with clarity.</h1>
            <p style={styles.copy}>
              Accept or reject appointment requests and keep the daily schedule
              visible in one premium dashboard.
            </p>
          </div>

          <div style={styles.filterCard}>
            <span style={styles.filterLabel}>Schedule date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
            <p style={styles.filterText}>The table below refreshes for the selected day.</p>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <MetricCard label="All Requests" value={appointments.length} tone="sky" />
          <MetricCard label="Pending" value={pendingCount} tone="amber" />
          <MetricCard label="Accepted" value={acceptedCount} tone="green" />
          <MetricCard label="Rejected" value={rejectedCount} tone="red" />
        </section>

        <section style={styles.tableCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.smallTag}>Daily Schedule</p>
              <h2 style={styles.sectionTitle}>Appointments for {selectedDate}</h2>
            </div>
          </div>

          <table border="1" cellPadding="12" style={styles.table}>
            <thead>
              <tr>
                <th>Patient Name</th>
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
                    <td>{appointment.patient || "N/A"}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span style={{ ...styles.badge, ...badgeColors[appointment.status] }}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div style={styles.actionRow}>
                        <button onClick={() => updateStatus(appointment.id, "Accepted")} style={{ ...styles.actionButton, background: "#15803d" }}>
                          Accept
                        </button>
                        <button onClick={() => updateStatus(appointment.id, "Rejected")} style={{ ...styles.actionButton, background: "#dc2626" }}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                    No appointments for this day
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

export default DoctorDashboard;

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
    background: "linear-gradient(135deg, rgba(18,52,71,0.96) 0%, rgba(14,116,144,0.95) 48%, rgba(15,118,110,0.94) 100%)",
    boxShadow: "0 28px 64px rgba(15, 50, 80, 0.14)",
  },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", opacity: 0.9 },
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  filterCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 24px 54px rgba(15, 50, 80, 0.1)",
  },
  filterLabel: { display: "block", color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  input: { width: "100%", marginTop: "14px", border: "1px solid #d6e2e8", borderRadius: "16px", padding: "14px 15px", boxSizing: "border-box" },
  filterText: { margin: "12px 0 0", color: "#5b7282", lineHeight: 1.6 },
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
  actionRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  actionButton: { border: "none", borderRadius: "12px", padding: "9px 14px", color: "#fff", cursor: "pointer" },
};
