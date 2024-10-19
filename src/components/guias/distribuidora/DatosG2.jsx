/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../../constants";
import { useState, useEffect } from "react";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG2.css";
import { codigos_espejo as companyNames } from "../../../constants/CodigosEspejo";

const DatosG2 = ({ proveedor, cargaActual, setCargas, cargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(() => {
    const saved = localStorage.getItem("selectedCompany");
    return saved ? JSON.parse(saved) : null;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    const saved = localStorage.getItem("inputValue");
    return saved || currentCarga?.destino || "";
  });

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem("selectedCompany", JSON.stringify(selectedCompany));
    } else {
      localStorage.removeItem("selectedCompany");
    }
  }, [selectedCompany]);

  useEffect(() => {
    localStorage.setItem("inputValue", inputValue);
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newData = {
      transporte: capitalizeWords(document.getElementById("transporte").value),
      destino: capitalizeWords(inputValue),
      estadoDestino: capitalizeWords(
        document.getElementById("estadoDestino").value
      ),
      codigo_espejo: selectedCompany?.codigo || "N/A",
    };

    guardar(proveedor, cargaActual, "/datosG3", newData);
  };

  const handleEmpresaInput = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = companyNames.filter((company) =>
      company.nombre.toLowerCase().startsWith(value)
    );
    setSuggestions(filtered);
    // Only set selectedCompany to null if the input doesn't match any company
    if (
      !filtered.some(
        (company) => company.nombre.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSelectedCompany(null);
    }
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Comercializadora: </h2>

          {/****** Nombre empresa transporte *****/}
          <label htmlFor="transporte">Nombre de empresa que transporta: </label>
          <input
            type="text"
            id="transporte"
            defaultValue={currentCarga?.transporte || ""}
          />

          {/****** Entidad destino *****/}
          <div className="empresa-input-container">
            <label htmlFor="destino">Entidad destino: </label>
            <div className="dropdown-container">
              <input
                type="text"
                id="destino"
                className="empresa-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleEmpresaInput(e);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((company) => (
                    <li
                      key={company.codigo}
                      onMouseDown={() => {
                        setInputValue(company.nombre);
                        setSelectedCompany(company);
                        setShowSuggestions(false);
                      }}
                      className="suggestion-item"
                    >
                      {company.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/****** Codigo espejo *****/}
          {selectedCompany && (
            <p className="selected-company-code">
              Código espejo: {selectedCompany.codigo}
            </p>
          )}

          {/****** Estado destino *****/}
          <label htmlFor="estadoDestino">Estado destino: </label>
          <input
            type="text"
            id="estadoDestino"
            defaultValue={currentCarga?.estadoDestino || ""}
          />

          {/****** Botones *****/}
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