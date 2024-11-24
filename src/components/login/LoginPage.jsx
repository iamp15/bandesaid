import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useAlert } from "../alert/AlertContext";

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { addAlert } = useAlert();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Firebase requires email format, so we convert ID to email format
      const email = `${idNumber}@yourdomain.com`;
      await login(email, password);
    } catch {
      addAlert(
        "Error al iniciar sesión. Verifica tus credenciales.",
        "error",
        4000
      );
    }
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="idNumber">Cédula:</label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Clave:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-group">
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
