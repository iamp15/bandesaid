import "../styles/LoadingSpinner.css";

const LoadingSpinner = () => {
  return (
    <div className="wrap-container">
      <div className="menu">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Cargando...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
