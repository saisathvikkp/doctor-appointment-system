import React from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
