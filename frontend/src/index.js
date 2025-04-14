import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppProvider from "./context/AppContext";
import OneSignal from 'react-onesignal';

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";

async function initializeOneSignal() {
  try {
    await OneSignal.init({
      appId: 'ba888a39-2e4e-4b37-bff1-e3736b585632',
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: true,
      },
    });
    OneSignal.showSlidedownPrompt();
  } catch (error) {
    console.error('OneSignal initialization failed:', error);
  }
}

const RootComponent = () => {
  useEffect(() => {
    initializeOneSignal();
  }, []);

  return (
    <AppProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/auth/*" element={<AuthLayout />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AppProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <RootComponent />
  </BrowserRouter>
);