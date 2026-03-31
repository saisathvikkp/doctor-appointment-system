import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { getStoredUser } from "../services/session";

function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then((res) => {
        setDoctor(res.data || null);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    try {
      const response = await api.post("/book", {
        patient_id: user?.id,
        doctor_id: Number(id),
        date,
        time,
      });

      alert(response.data.message || "Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      alert(error.response?.data?.message || "Could not book appointment");
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <div>
            <p style={styles.tag}>Booking Desk</p>
            <h1 style={styles.heading}>Choose the perfect slot for your consultation.</h1>
            <p style={styles.copy}>
              Finalize your appointment with {doctor?.name || `doctor #${id}`} and get status updates right inside the app.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Booking For</span>
            <strong style={styles.summaryValue}>{doctor?.name || `Doctor #${id}`}</strong>
            <p style={styles.summaryText}>Your request will be created with pending status until the doctor reviews it.</p>
            <div style={styles.summaryMeta}>
              <div style={styles.metaBlock}>
                <span style={styles.metaLabel}>Specialization</span>
                <strong style={styles.metaValue}>{doctor?.specialization || "Loading..."}</strong>
              </div>
              <div style={styles.metaBlock}>
                <span style={styles.metaLabel}>Consultation Fee</span>
                <strong style={styles.metaValue}>
                  {doctor?.consultation_fee != null ? `Rs. ${doctor.consultation_fee}` : "Loading..."}
                </strong>
              </div>
              <div style={styles.metaBlock}>
                <span style={styles.metaLabel}>Clinic Address</span>
                <strong style={styles.metaValue}>{doctor?.address || "Loading..."}</strong>
              </div>
              <div style={styles.paymentNote}>
                {doctor?.payment_note || "Payment details will appear here once doctor details load."}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Select Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Select Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.button}>
              Confirm Appointment
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}

export default BookAppointment;

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.8fr)", gap: "22px" },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", color: "#0e7490" },
  heading: { margin: "14px 0 12px", fontSize: "46px", lineHeight: 1.08, color: "#173247" },
  copy: { margin: 0, maxWidth: "680px", color: "#5b7282", lineHeight: 1.7 },
  summaryCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 24px 54px rgba(15, 50, 80, 0.1)",
  },
  summaryLabel: { display: "block", color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  summaryValue: { display: "block", marginTop: "12px", color: "#173247", fontSize: "28px" },
  summaryText: { margin: "12px 0 0", color: "#5b7282", lineHeight: 1.65 },
  summaryMeta: { display: "grid", gap: "12px", marginTop: "18px" },
  metaBlock: {
    display: "grid",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "18px",
    background: "#f5fbfc",
    border: "1px solid #d7e9ee",
  },
  metaLabel: { color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  metaValue: { color: "#173247", lineHeight: 1.5 },
  paymentNote: {
    padding: "12px 14px",
    borderRadius: "18px",
    background: "#eef8ff",
    color: "#36576a",
    lineHeight: 1.6,
  },
  formCard: {
    background: "rgba(255,255,255,0.86)",
    borderRadius: "28px",
    padding: "26px",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 20px 48px rgba(15, 50, 80, 0.08)",
  },
  fieldGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" },
  field: { marginBottom: "18px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "700", color: "#27485d" },
  input: { width: "100%", borderRadius: "16px", border: "1px solid #d6e2e8", padding: "15px 16px", boxSizing: "border-box" },
  button: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "15px 16px",
    background: "linear-gradient(135deg, #0f766e 0%, #0e7490 100%)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
