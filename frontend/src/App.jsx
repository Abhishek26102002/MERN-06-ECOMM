import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SettingPage from "./pages/SettingPage";
import { useThemeStore } from "./ApiStore/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CartPage from "./pages/CartPage";
import ConfirmPage from "./pages/ConfirmPage";
import Navbar from "./components/Navbar";

function App() {
  const { theme } = useThemeStore();

  // console.log(onlineUsers);

  if (false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      {/* Common in all Pages Navbar */}
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        {/* Might make confirm page secure that take token and generate Dymanic content like order id and all */}
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/setting" element={<SettingPage />} />
        <Route path="*" element={<HomePage />} />

      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
