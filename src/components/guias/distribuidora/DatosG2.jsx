/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../../constants";
import { useState, useEffect } from "react";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG2.css";

const DatosG2 = ({ proveedor, cargaActual, setCargas, cargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [poneTransporte, setPoneTransporte] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newData = {
      empresa: capitalizeWords(document.getElementById("empresa").value),
      destino: capitalizeWords(document.getElementById("destino").value),
      transporte: capitalizeWords(document.getElementById("empresa").value),
      estadoDestino: capitalizeWords(
        document.getElementById("estadoDestino").value
      ),
    };

    if (!poneTransporte) {
      newData.transporte = capitalizeWords(
        document.getElementById("transporte").value
      );
    }

    guardar(proveedor, cargaActual, "/datosG3", newData);
  };

  useEffect(() => {
    setPoneTransporte(currentCarga?.poneTransporte ?? true);
  }, [currentCarga]);

  const handleTransporteChange = (e) => {
    setPoneTransporte(e.target.checked);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Comercializadora: </h2>
          <label htmlFor="empresa">Nombre: </label>
          <input
            type="text"
            id="empresa"
            defaultValue={currentCarga?.empresa || ""}
          />
          <div className="checkbox-container">
            <label htmlFor="poneTransporte">¿Pone transporte?</label>
            <input
              type="checkbox"
              id="poneTransporte"
              checked={poneTransporte}
              onChange={handleTransporteChange}
            />
          </div>
          {!poneTransporte && (
            <div>
              <label htmlFor="transporte">Transporte: </label>
              <input
                type="text"
                id="transporte"
                defaultValue={currentCarga?.transporte || ""}
              />
            </div>
          )}
          <label htmlFor="destino">Entidad destino: </label>
          <input
            type="text"
            id="destino"
            defaultValue={currentCarga?.destino || ""}
          />
          <label htmlFor="estadoDestino">Estado destino: </label>
          <input
            type="text"
            id="estadoDestino"
            defaultValue={currentCarga?.estadoDestino || ""}
          />
          <div className="button-group">
            <Link to={"/datosg1"}>
              <button>Atras</button>
            </Link>
            <button type="submit">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatosG2;
