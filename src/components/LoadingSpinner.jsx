import "../styles/LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
