import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { getStoredUser } from "../services/session";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const user = getStoredUser();

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    loadNotifications();
  }, [loadNotifications, user?.id]);

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/read/${notificationId}`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <Layout>
      <div style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <p style={styles.tag}>Notifications</p>
            <h1 style={styles.heading}>Stay updated on every booking and doctor response.</h1>
            <p style={styles.copy}>
              See when appointments are created, accepted, or rejected without
              losing track of your care journey.
            </p>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Unread updates</span>
            <strong style={styles.summaryValue}>{unreadCount}</strong>
            <p style={styles.summaryText}>Open a notification and mark it as read once you have seen it.</p>
          </div>
        </section>

        <section style={styles.listPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.smallTag}>Patient Feed</p>
              <h2 style={styles.sectionTitle}>Latest updates</h2>
            </div>
          </div>

          <div style={styles.feed}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  style={{
                    ...styles.notificationCard,
                    ...(notification.is_read ? styles.readCard : styles.unreadCard),
                  }}
                >
                  <div style={styles.notificationHeader}>
                    <div>
                      <span style={{ ...styles.typeBadge, ...(typeStyles[notification.type] || typeStyles.default) }}>
                        {notification.type.replace("_", " ")}
                      </span>
                      <h3 style={styles.notificationTitle}>{notification.title}</h3>
                    </div>
                    {!notification.is_read && (
                      <button onClick={() => markAsRead(notification.id)} style={styles.readButton}>
                        Mark as read
                      </button>
                    )}
                  </div>
                  <p style={styles.notificationMessage}>{notification.message}</p>
                  <span style={styles.timestamp}>{notification.created_at}</span>
                </article>
              ))
            ) : (
              <div style={styles.emptyState}>No notifications yet. Book an appointment to start receiving updates.</div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}

const typeStyles = {
  booking: { background: "#dbeafe", color: "#1d4ed8" },
  status_update: { background: "#dcfce7", color: "#166534" },
  default: { background: "#f3f4f6", color: "#374151" },
};

const styles = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  hero: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" },
  heroPanel: {
    padding: "34px",
    borderRadius: "30px",
    color: "#fff",
    background: "linear-gradient(135deg, rgba(18,52,71,0.96) 0%, rgba(14,116,144,0.95) 52%, rgba(15,118,110,0.92) 100%)",
    boxShadow: "0 28px 64px rgba(15, 50, 80, 0.14)",
  },
  tag: { margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "12px", fontWeight: "700", opacity: 0.9 },
  heading: { margin: "14px 0 12px", fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.08 },
  copy: { margin: 0, maxWidth: "640px", color: "rgba(255,255,255,0.88)", lineHeight: 1.7 },
  summaryCard: {
    padding: "28px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(255,255,255,0.78)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 24px 54px rgba(15, 50, 80, 0.1)",
  },
  summaryLabel: { display: "block", color: "#0e7490", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" },
  summaryValue: { display: "block", marginTop: "12px", color: "#173247", fontSize: "48px" },
  summaryText: { margin: "12px 0 0", color: "#5b7282", lineHeight: 1.65 },
  listPanel: {
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
  feed: { display: "grid", gap: "16px", marginTop: "18px" },
  notificationCard: {
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid #e2edf3",
  },
  unreadCard: {
    background: "#f8fbfd",
    boxShadow: "0 14px 32px rgba(15, 50, 80, 0.08)",
  },
  readCard: {
    background: "#ffffff",
    opacity: 0.88,
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  typeBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  notificationTitle: { margin: "10px 0 0", color: "#173247", fontSize: "24px" },
  notificationMessage: { margin: "12px 0 10px", color: "#5b7282", lineHeight: 1.7 },
  timestamp: { color: "#8093a0", fontSize: "13px" },
  readButton: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    background: "#0e7490",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  emptyState: {
    padding: "28px",
    borderRadius: "22px",
    background: "#f8fbfd",
    border: "1px solid #e2edf3",
    color: "#5b7282",
  },
};

export default Notifications;
