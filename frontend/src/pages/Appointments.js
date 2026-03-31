import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { getStoredUser } from "../services/session";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", feedback: "" });
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
    api.get("/doctors")
      .then((res) => {
        setDoctors(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [loadAppointments, user?.id]);

  const cancelAppointment = async (id) => {
    try {
      await api.delete(`/cancel/${id}`);
      alert("Appointment Cancelled Successfully");
      loadAppointments();
    } catch (err) {
      alert("Error cancelling appointment");
    }
  };

  const openReviewForm = (appointment) => {
    const matchedDoctor = doctors.find((doctor) => doctor.id === appointment.doctor_id || doctor.name === appointment.doctor);
    const resolvedDoctorId = appointment.doctor_id || matchedDoctor?.id || null;

    setActiveReview({
      appointmentId: appointment.id,
      doctorId: resolvedDoctorId,
      doctorName: appointment.doctor,
    });
    setReviewForm({ rating: "5", feedback: "" });
  };

  const closeReviewForm = () => {
    setActiveReview(null);
    setReviewForm({ rating: "5", feedback: "" });
  };

  const submitReview = async () => {
    if (!activeReview?.doctorId) {
      alert("Doctor could not be identified for this review. Please refresh once and try again.");
      return;
    }

    try {
      await api.post("/reviews", {
        patient_id: user.id,
        appointment_id: activeReview.appointmentId,
        doctor_id: activeReview.doctorId,
        rating: Number(reviewForm.rating),
        feedback: reviewForm.feedback,
      });
      alert("Review submitted successfully");
      closeReviewForm();
      loadAppointments();
    } catch (error) {
      const fallbackMessage = error.response?.status === 404
        ? "Review service is not available yet. Please restart the backend and try again."
        : error.response?.data?.message || "Could not submit review. Please try again after refreshing.";
      alert(fallbackMessage);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.heroPanel}>
          <p style={styles.tag}>Appointment Status</p>
          <h1 style={styles.heading}>Track every booking with confidence.</h1>
          <p style={styles.copy}>
            See what is pending, what has been accepted, and leave feedback for
            doctors after a successful consultation.
          </p>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.smallTag}>Status Board</p>
              <h2 style={styles.sectionTitle}>All appointments</h2>
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
                    <td>
                      <div style={styles.doctorCell}>
                        <span>{appointment.doctor}</span>
                        {appointment.status === "Accepted" && (
                          <span style={styles.reviewHint}>
                            {appointment.review_submitted ? "Review saved" : "Ready for review"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span
                        style={{
                          ...styles.badge,
                          ...(appointment.status === "Accepted"
                            ? { background: "#d1fae5", color: "#065f46" }
                            : appointment.status === "Rejected"
                              ? { background: "#fee2e2", color: "#991b1b" }
                              : { background: "#fff3cd", color: "#8a5a00" }),
                        }}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      {appointment.status === "Pending" ? (
                        <button onClick={() => cancelAppointment(appointment.id)} style={styles.cancelButton}>
                          Cancel
                        </button>
                      ) : appointment.status === "Accepted" ? (
                        <button
                          onClick={() => openReviewForm(appointment)}
                          style={styles.reviewButton}
                        >
                          {appointment.review_submitted ? "Update Review" : "Rate Doctor"}
                        </button>
                      ) : (
                        <span style={styles.lockedText}>Closed</span>
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

        {activeReview && (
          <div style={styles.reviewOverlay}>
            <section style={styles.reviewModal}>
              <div style={styles.sectionHeader}>
                <div>
                  <p style={styles.smallTag}>Doctor Feedback</p>
                  <h2 style={styles.sectionTitle}>Rate {activeReview.doctorName}</h2>
                </div>
              </div>

              <div style={styles.reviewForm}>
                <div style={styles.reviewIntro}>
                  Your review helps improve the care experience for future patients.
                </div>

                <div>
                  <label style={styles.label}>Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                    style={styles.input}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Feedback</label>
                  <textarea
                    value={reviewForm.feedback}
                    onChange={(event) => setReviewForm((current) => ({ ...current, feedback: event.target.value }))}
                    style={styles.textarea}
                    placeholder="Share what went well and how the consultation felt."
                  />
                </div>

                <div style={styles.reviewActionRow}>
                  <button onClick={submitReview} style={styles.reviewButton}>
                    Submit Review
                  </button>
                  <button onClick={closeReviewForm} style={styles.secondaryButton}>
                    Close
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Appointments;

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  heroPanel: {
    padding: "34px",
    borderRadius: "30px",
    color: "#fff",
    background: "linear-gradient(135deg, rgba(18,52,71,0.96) 0%, rgba(14,116,144,0.94) 52%, rgba(15,118,110,0.92) 100%)",
    boxShadow: "0 28px 64px rgba(15, 50, 80, 0.14)",
  },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", opacity: 0.9 },
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  tableCard: {
    background: "rgba(255,255,255,0.86)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 20px 48px rgba(15, 50, 80, 0.08)",
  },
  reviewOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 25, 39, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
  },
  reviewModal: {
    width: "100%",
    maxWidth: "620px",
    background: "rgba(255,255,255,0.97)",
    borderRadius: "28px",
    padding: "24px",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 24px 70px rgba(15, 50, 80, 0.2)",
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  smallTag: { margin: 0, color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  sectionTitle: { margin: "8px 0 0", color: "#173247", fontSize: "30px" },
  table: { width: "100%", borderCollapse: "collapse" },
  doctorCell: { display: "flex", flexDirection: "column", gap: "4px" },
  reviewHint: { color: "#0e7490", fontSize: "12px", fontWeight: "700" },
  badge: { display: "inline-block", padding: "7px 12px", borderRadius: "999px", fontWeight: "700", fontSize: "13px" },
  cancelButton: { border: "none", borderRadius: "12px", padding: "9px 14px", background: "#dc2626", color: "#fff", cursor: "pointer" },
  reviewButton: { border: "none", borderRadius: "12px", padding: "9px 14px", background: "#0e7490", color: "#fff", cursor: "pointer" },
  secondaryButton: { border: "1px solid #d6e2e8", borderRadius: "12px", padding: "9px 14px", background: "#fff", color: "#27485d", cursor: "pointer" },
  lockedText: { color: "#7b8b96" },
  reviewForm: { display: "grid", gap: "16px", marginTop: "18px" },
  reviewIntro: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#eff8ff",
    color: "#355468",
    lineHeight: 1.6,
  },
  reviewActionRow: { display: "flex", gap: "12px", flexWrap: "wrap" },
  label: { display: "block", marginBottom: "8px", fontWeight: "700", color: "#27485d" },
  input: { width: "100%", borderRadius: "16px", border: "1px solid #d6e2e8", padding: "15px 16px", boxSizing: "border-box" },
  textarea: { width: "100%", minHeight: "130px", borderRadius: "16px", border: "1px solid #d6e2e8", padding: "15px 16px", boxSizing: "border-box", resize: "vertical" },
};
