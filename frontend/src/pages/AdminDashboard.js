import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const initialDoctorForm = {
  name: "",
  specialization: "",
  email: "",
  password: "",
  address: "",
  consultation_fee: "",
};

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_doctors: 0,
    total_appointments: 0,
  });
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/doctors"),
        api.get("/admin/users"),
        api.get("/admin/appointments"),
      ]);

      if (results[0].status === "fulfilled") {
        setStats(results[0].value.data);
      }

      if (results[1].status === "fulfilled") {
        setDoctors(results[1].value.data);
      } else {
        setDoctors([]);
      }

      if (results[2].status === "fulfilled") {
        setUsers(results[2].value.data);
      } else {
        setUsers([]);
      }

      if (results[3].status === "fulfilled") {
        setAppointments(results[3].value.data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to load admin dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDoctorFormChange = (event) => {
    const { name, value } = event.target;
    setDoctorForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddDoctor = async (event) => {
    event.preventDefault();

    try {
      await api.post("/add_doctor", doctorForm);
      setDoctorForm(initialDoctorForm);
      await loadAdminData();
      alert("Doctor added successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add doctor.");
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    try {
      await api.delete(`/delete_doctor/${doctorId}`);
      await loadAdminData();
      alert("Doctor removed successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove doctor.");
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <p style={styles.tag}>Admin Panel</p>
            <h1 style={styles.heading}>Manage doctors, users, and appointments from one polished workspace.</h1>
            <p style={styles.copy}>
              This admin area gives you live project stats, doctor management,
              user visibility, and a complete appointment overview.
            </p>
          </div>

          <div style={styles.heroInfoCard}>
            <span style={styles.heroInfoLabel}>Control Center</span>
            <strong style={styles.heroInfoValue}>Secure Admin Workspace</strong>
            <span style={styles.heroInfoText}>
              Monitor platform activity, manage doctors, and oversee appointments from one place.
            </span>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <MetricCard label="Total Users" value={stats.total_users} tone="sky" />
          <MetricCard label="Total Doctors" value={stats.total_doctors} tone="green" />
          <MetricCard label="Appointments" value={stats.total_appointments} tone="amber" />
        </section>

        <section style={styles.twoColumnGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.smallTag}>Doctor Control</p>
                <h2 style={styles.panelTitle}>Add Doctor</h2>
              </div>
            </div>

            <form onSubmit={handleAddDoctor} style={styles.form}>
              <input
                name="name"
                placeholder="Doctor Name"
                value={doctorForm.name}
                onChange={handleDoctorFormChange}
                style={styles.input}
                required
              />
              <input
                name="specialization"
                placeholder="Specialization"
                value={doctorForm.specialization}
                onChange={handleDoctorFormChange}
                style={styles.input}
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Doctor Email"
                value={doctorForm.email}
                onChange={handleDoctorFormChange}
                style={styles.input}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Doctor Password"
                value={doctorForm.password}
                onChange={handleDoctorFormChange}
                style={styles.input}
                required
              />
              <input
                name="address"
                placeholder="Clinic Address"
                value={doctorForm.address}
                onChange={handleDoctorFormChange}
                style={styles.input}
              />
              <input
                name="consultation_fee"
                type="number"
                min="0"
                placeholder="Consultation Fee"
                value={doctorForm.consultation_fee}
                onChange={handleDoctorFormChange}
                style={styles.input}
              />
              <button type="submit" style={styles.primaryButton}>
                Add Doctor
              </button>
            </form>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <p style={styles.smallTag}>Doctor Directory</p>
                <h2 style={styles.panelTitle}>Remove Doctor</h2>
              </div>
            </div>

            <div style={styles.listWrap}>
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} style={styles.listCard}>
                    <div>
                      <strong style={styles.listTitle}>{doctor.name}</strong>
                      <p style={styles.listMeta}>{doctor.specialization}</p>
                      <p style={styles.listMeta}>{doctor.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoctor(doctor.id)}
                      style={styles.dangerButton}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div style={styles.emptyCard}>
                  No doctors available to remove right now.
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.smallTag}>System Users</p>
              <h2 style={styles.panelTitle}>View Users</h2>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{ ...styles.badge, ...roleBadge[user.role] }}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.smallTag}>Booking Overview</p>
              <h2 style={styles.panelTitle}>All Appointments</h2>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patient}</td>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span style={{ ...styles.badge, ...statusBadge[appointment.status] }}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {loading && <p style={styles.loadingText}>Loading admin data...</p>}
      </div>
    </Layout>
  );
}

function MetricCard({ label, value, tone }) {
  const toneStyles = {
    sky: { background: "linear-gradient(135deg, #e6f7ff 0%, #cfeeff 100%)", color: "#0e7490" },
    green: { background: "linear-gradient(135deg, #e4fff2 0%, #cbf7df 100%)", color: "#15803d" },
    amber: { background: "linear-gradient(135deg, #fff5db 0%, #ffe5b5 100%)", color: "#b45309" },
  };

  return (
    <div style={{ ...styles.metricCard, ...toneStyles[tone] }}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  );
}

const roleBadge = {
  admin: { background: "#ede9fe", color: "#6d28d9" },
  patient: { background: "#dbeafe", color: "#1d4ed8" },
};

const statusBadge = {
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
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.8rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  heroInfoCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(255,255,255,0.78)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 24px 54px rgba(15, 50, 80, 0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "10px",
  },
  heroInfoLabel: { color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  heroInfoValue: { color: "#173247", fontSize: "24px" },
  heroInfoText: { color: "#5b7282" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" },
  metricCard: { borderRadius: "24px", padding: "22px", boxShadow: "0 16px 40px rgba(15, 50, 80, 0.08)" },
  metricLabel: { display: "block", fontWeight: "700", fontSize: "14px" },
  metricValue: { display: "block", fontSize: "40px", marginTop: "10px" },
  twoColumnGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px" },
  panel: {
    background: "rgba(255,255,255,0.86)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 20px 48px rgba(15, 50, 80, 0.08)",
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  smallTag: { margin: 0, color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  panelTitle: { margin: "8px 0 0", color: "#173247", fontSize: "28px" },
  form: { display: "grid", gap: "14px" },
  input: {
    width: "100%",
    border: "1px solid #d6e2e8",
    borderRadius: "16px",
    padding: "14px 15px",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.9)",
  },
  primaryButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 16px",
    background: "linear-gradient(135deg, #0f766e 0%, #0e7490 100%)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  dangerButton: {
    border: "none",
    borderRadius: "14px",
    padding: "11px 14px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    alignSelf: "center",
  },
  listWrap: { display: "grid", gap: "14px", maxHeight: "420px", overflowY: "auto" },
  listCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    padding: "18px",
    borderRadius: "20px",
    background: "#f8fbfd",
    border: "1px solid #e2edf3",
  },
  listTitle: { display: "block", color: "#173247", marginBottom: "6px" },
  listMeta: { margin: "4px 0 0", color: "#5b7282" },
  emptyCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "#f8fbfd",
    border: "1px solid #e2edf3",
    color: "#5b7282",
    lineHeight: 1.6,
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  badge: { display: "inline-block", padding: "7px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "13px" },
  loadingText: { margin: 0, color: "#5b7282" },
};

export default AdminDashboard;
