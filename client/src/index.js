import React from "react";
import ReactDOM from "react-dom/client";
import "normalize.css";
import "./index.css";
import axios from 'axios';
import App from "./App";
import { AppProvider } from "./context/appContext";


axios.defaults.baseURL = "[https://cuvette-2-qwtm.onrender.com](https://cuvette-2-qwtm.onrender.com)";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
