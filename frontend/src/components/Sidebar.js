import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, useStoredUser } from "../services/session";

function Sidebar() {
  const user = useStoredUser();
  const location = useLocation();
  const navigate = useNavigate();

  const links = user?.role === "doctor"
    ? [{ to: "/doctor-dashboard", label: "Doctor Dashboard" }]
    : user?.role === "admin"
      ? [{ to: "/admin-dashboard", label: "Admin Dashboard" }]
      : [
          { to: "/dashboard", label: "My Dashboard" },
          { to: "/doctors", label: "Find Doctors" },
          { to: "/appointments", label: "My Appointments" },
          { to: "/notifications", label: "Notifications" },
        ];

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const roleLabel = user?.role === "doctor"
    ? "Doctor Workspace"
    : user?.role === "admin"
      ? "Admin Control"
      : "Patient Portal";

  const cardTitle = user?.role === "doctor"
    ? "Today's schedule"
    : user?.role === "admin"
      ? "System overview"
      : "Easy booking";

  const cardText = user?.role === "doctor"
    ? "Review requests and manage daily appointments."
    : user?.role === "admin"
      ? "Manage doctors, users, and the full appointment flow."
      : "Choose doctors, book faster, and track every update.";

  return (
    <aside className="dashboard-sidebar" style={styles.sidebar}>
      <div>
        <p style={styles.roleTag}>{roleLabel}</p>
        <h3 style={styles.title}>CareFlow</h3>
        <p style={styles.userName}>{user?.name || "Guest"}</p>
        <div style={styles.userCard}>
          <strong style={styles.userCardValue}>{cardTitle}</strong>
          <span style={styles.userCardText}>{cardText}</span>
        </div>
      </div>

      <div>
        <ul className="sidebar-link-list" style={styles.list}>
          {links.map((link) => (
            <li key={link.to} style={styles.listItem}>
              <Link
                to={link.to}
                className="sidebar-link"
                style={{
                  ...styles.link,
                  ...(location.pathname === link.to ? styles.activeLink : {}),
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

const styles = {
  sidebar: {
    width: "290px",
    minHeight: "100vh",
    position: "fixed",
    padding: "28px 22px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
    background:
      "linear-gradient(180deg, rgba(12,40,58,0.96) 0%, rgba(15,76,92,0.94) 52%, rgba(10,113,107,0.92) 100%)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 44px rgba(13, 35, 54, 0.18)",
  },
  roleTag: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#9bd7e7",
  },
  title: {
    margin: "10px 0 8px",
    fontSize: "34px",
  },
  userName: {
    margin: 0,
    color: "#d9eef6",
  },
  userCard: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(14px)",
  },
  userCardValue: {
    display: "block",
    marginBottom: "8px",
  },
  userCardText: {
    display: "block",
    color: "#d5edf6",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 16px",
  },
  listItem: {
    marginBottom: "12px",
  },
  link: {
    display: "block",
    padding: "13px 15px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
    transition: "all 0.2s ease",
  },
  activeLink: {
    background: "#ffd7b7",
    color: "#173247",
    fontWeight: "700",
    boxShadow: "0 14px 28px rgba(249, 115, 22, 0.16)",
  },
  logoutButton: {
    width: "100%",
    border: "none",
    borderRadius: "16px",
    padding: "13px 15px",
    background: "#fff3ec",
    color: "#9a3412",
    fontWeight: "700",
    cursor: "pointer",
  },
};
