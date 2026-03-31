import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Appointments from "./pages/Appointments";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import { useStoredUser } from "./services/session";
import "./styles/main.css";

function App() {
  const user = useStoredUser();

  const requireRole = (role, element) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
      return (
        <Navigate
          to={
            user.role === "doctor"
              ? "/doctor-dashboard"
              : user.role === "admin"
                ? "/admin-dashboard"
                : "/dashboard"
          }
          replace
        />
      );
    }

    return element;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={
                  user.role === "doctor"
                    ? "/doctor-dashboard"
                    : user.role === "admin"
                      ? "/admin-dashboard"
                      : "/dashboard"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={requireRole("patient", <Doctors />)} />
        <Route path="/book/:id" element={requireRole("patient", <BookAppointment />)} />
        <Route path="/dashboard" element={requireRole("patient", <PatientDashboard />)} />
        <Route path="/appointments" element={requireRole("patient", <Appointments />)} />
        <Route path="/notifications" element={requireRole("patient", <Notifications />)} />
        <Route path="/doctor-dashboard" element={requireRole("doctor", <DoctorDashboard />)} />
        <Route path="/admin-dashboard" element={requireRole("admin", <AdminDashboard />)} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
