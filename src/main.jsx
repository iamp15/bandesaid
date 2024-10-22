import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter as Router } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <ScrollToTop />
    <App />
  </Router>
);