import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  // If we are served from the same server (production), use relative path
  if (process.env.NODE_ENV === "production" || window.location.port === "" || window.location.port === "80") {
    return "";
  }
  return "http://localhost:5000";
};


const baseURL = getBaseURL();
console.log("🔗 API Base URL:", baseURL || "(relative)");
axios.defaults.baseURL = baseURL;



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ims_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
      } catch (e) {
        localStorage.removeItem("ims_user");
      }
    }
    setLoading(false);
  }, []);

  // Handle unauthorized errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = (data) => {
    const flat = { token: data.token, ...data.user };
    setUser(flat);
    localStorage.setItem("ims_user", JSON.stringify(flat));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ims_user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
