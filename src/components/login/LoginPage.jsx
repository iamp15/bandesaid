import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { storageUtils } from "../../utils/LoginPersistance";

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = storageUtils.getUser();
    if (savedUser) {
      navigate("/menu");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Firebase requires email format, so we convert ID to email format
      const email = `${idNumber}@yourdomain.com`;
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Store user data in localStorage
      const userToStore = {
        id: result.user.uid,
        email: result.user.email,
        ...currentUser, // spread any additional user data
      };

      storageUtils.setUser(userToStore);
      const token = await result.user.getIdToken();
      storageUtils.setAuthToken(token);

      // Login successful
      console.log("Login successful");
      navigate("/menu");
    } catch (error) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

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
