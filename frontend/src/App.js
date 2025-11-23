import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Appointments from "./pages/Appointments";
import Consultation from "./pages/Consultation";
import Prescriptions from "./pages/Prescriptions";
import Billing from "./pages/Billing";
import UserManagement from "./pages/UserManagement";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={!user ? <LandingPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/patients"
            element={user ? <Patients user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/patients/:patientId"
            element={user ? <PatientProfile user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/appointments"
            element={user ? <Appointments user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/consultation"
            element={user ? <Consultation user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/prescriptions"
            element={user ? <Prescriptions user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/billing"
            element={user ? <Billing user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/user-management"
            element={user && user.role === "ADMIN" ? <UserManagement token={localStorage.getItem("token")} user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;