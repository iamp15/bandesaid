import { useNavigate } from "react-router-dom";
import { RUBRO } from "../../constants/constants";
import "../../styles/guias/revisionGuias.css";
import LoadingSpinner from "../LoadingSpinner";
import { useEstados } from "../../contexts/EstadosContext";

const RevisionGuias = () => {
  const { cargaActual, proveedor, currentCarga } = useEstados();
  const navigate = useNavigate();

  if (!currentCarga || !currentCarga.id) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const handleContinue = () => {
    // Check for missing required fields
    const missingFields = [];
    if (!currentCarga.chofer) missingFields.push("Nombre del chofer");
    if (!currentCarga.cedula) missingFields.push("Cédula");
    if (!currentCarga.marcaVehiculo) missingFields.push("Marca vehículo");
    if (!currentCarga.placa) missingFields.push("Placa");
    if (!currentCarga.destino) missingFields.push("Entidad destino");
    if (!currentCarga.codigo_espejo) missingFields.push("Código espejo");
    if (!currentCarga.estadoDestino) missingFields.push("Estado destino");
    if (!currentCarga.transporte) missingFields.push("Transporte");
    if (!currentCarga.marca_rubro) missingFields.push("Marca");
    if (!currentCarga.lote) missingFields.push("Lote");
    if (!currentCarga.p_promedio) missingFields.push("Peso promedio");
    if (!currentCarga.t_promedio) missingFields.push("Temperatura promedio");
    if (!currentCarga.p_total) missingFields.push("Peso total de la carga");
    if (!currentCarga.p_verificado) missingFields.push("Peso verificado");
    // Safely check codigos_guias and precintos arrays
    if (
      !Array.isArray(currentCarga.codigos_guias) ||
      currentCarga.codigos_guias.length === 0 ||
      !currentCarga.codigos_guias[0]
    )
      missingFields.push("Código(s) de guía");
    if (
      !Array.isArray(currentCarga.precintos) ||
      currentCarga.precintos.length === 0 ||
      !currentCarga.precintos[0]
    )
      missingFields.push("Precintos");
    if (!currentCarga.id_despacho) missingFields.push("ID del despacho");

    if (missingFields.length > 0) {
      alert(
        "Faltan los siguientes campos obligatorios:\n\n" +
          missingFields.join("\n")
      );
      return;
    }
    navigate("/formulariosguia");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Verificación de Datos</h2>
        <div className="section">
          <h3>Chofer y Vehículo</h3>
          <p>
            Nombre: <span className="value">{currentCarga.chofer}</span>{" "}
          </p>
          <p>
            Cédula: <span className="value">{currentCarga.cedula}</span>{" "}
          </p>
          <p>
            Marca vehículo:{" "}
            <span className="value">{currentCarga.marcaVehiculo}</span>{" "}
          </p>
          <p>
            Placa: <span className="value">{currentCarga.placa}</span>{" "}
          </p>
          <button onClick={() => navigate("/datosg1")}>Editar</button>
        </div>

        <div className="section">
          <h3>Comercializadora</h3>
          <p>
            Entidad destino:{" "}
            <span className="value">{currentCarga.destino}</span>
          </p>
          <p>
            Código espejo:{" "}
            <span className="value">{currentCarga.codigo_espejo}</span>
          </p>
          <p>
            Estado destino:{" "}
            <span className="value">{currentCarga.estadoDestino}</span>
          </p>
          <p>
            Transporte: <span className="value">{currentCarga.transporte}</span>
          </p>
          <button onClick={() => navigate("/datosg2")}>Editar</button>
        </div>

        <div className="section">
          <h3>Control de Calidad y Pesaje</h3>
          <p>
            Rubro: <span className="value">{RUBRO}</span>
          </p>
          <p>
            Marca: <span className="value">{currentCarga.marca_rubro}</span>
          </p>
          <p>
            Lote: <span className="value">{currentCarga.lote}</span>
          </p>
          <p>
            Peso promedio:{" "}
            <span className="value">{currentCarga.p_promedio} kg</span>
          </p>
          <p>
            Temperatura promedio:{" "}
            <span className="value">{currentCarga.t_promedio} ºC</span>
          </p>
          <p>
            Peso total de la carga:{" "}
            <span className="value">{currentCarga.p_total} kg</span>
          </p>
          <p>
            Peso verificado:{" "}
            <span className="value">{currentCarga.p_verificado} kg</span>
          </p>
          <button onClick={() => navigate("/datosg3")}>Editar</button>
        </div>

        <div className="section">
          <h3>Datos Guía</h3>
          {Array.isArray(currentCarga.codigos_guias) &&
          currentCarga.codigos_guias.length > 1 ? (
            <div>
              {currentCarga.codigos_guias.map((codigo, index) => (
                <p key={index}>
                  Guía {index + 1} -{" "}
                  <span className="value">
                    {codigo} -{" "}
                    {currentCarga.pesos_guias &&
                      currentCarga.pesos_guias[index]}{" "}
                    kg
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p>
              Código guía:{" "}
              <span className="value">
                {Array.isArray(currentCarga.codigos_guias) &&
                currentCarga.codigos_guias.length > 0
                  ? currentCarga.codigos_guias[0]
                  : ""}
              </span>
            </p>
          )}
          <p>
            Precintos:{" "}
            <span className="value">
              {Array.isArray(currentCarga.precintos) &&
              currentCarga.precintos.length > 0
                ? currentCarga.precintos.join(", ")
                : "S/P"}
            </span>
          </p>
          <p>
            ID del despacho:{" "}
            <span className="value">{currentCarga.id_despacho}</span>
          </p>
          <button onClick={() => navigate("/datosg4")}>Editar</button>
        </div>

        <div className="button-group">
          <button onClick={handleContinue}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default RevisionGuias;
