import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  console.log("LoginPage rendering"); //
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    console.log("Component mounted");
    if (auth) {
      setIsLoading(false);
    }
    return () => {
      console.log("Component unmounted");
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Firebase requires email format, so we convert ID to email format
      const email = `${idNumber}@yourdomain.com`;
      await signInWithEmailAndPassword(auth, email, password);

      // Login successful
      console.log("Login successful");
      console.log("User Data:", userData);
      console.log("name:", userData.name);
      //navigate("/menu");
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
