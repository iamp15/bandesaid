/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../../constants/constants";
import { useState, useEffect } from "react";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG2.css";
import { codigos_espejo as companyNames } from "../../../constants/CodigosEspejo";
import { sinCodigo } from "../../../constants/Sincodigo";

const DatosG2 = ({ proveedor, cargaActual, setCargas, cargas }) => {
  const guardar = useGuardar(setCargas);
  const currentCarga = cargas[PROVIDER_MAP[proveedor]]?.[cargaActual - 1] || {};
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(() => {
    if (currentCarga?.destino) {
      return (
        companyNames.find(
          (company) => company.nombre === currentCarga.destino
        ) || {
          nombre: currentCarga.destino,
          codigo: currentCarga.codigo_espejo,
        }
      );
    }
    return null;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(
    () => currentCarga?.destino || ""
  );

  useEffect(() => {
    if (currentCarga) {
      setInputValue(currentCarga.destino || "");
      if (currentCarga.destino) {
        const matchingCompanyMain = companyNames.find(
          (company) => company.nombre === currentCarga.destino
        );

        // Then check in SinCodigo list
        const matchingCompanySinCodigo = sinCodigo.find(
          (company) => company.nombre === currentCarga.destino
        );

        let matchingCompany;
        if (matchingCompanySinCodigo) {
          // If found in sinCodigo, set codigo to "N/A"
          matchingCompany = {
            nombre: matchingCompanySinCodigo.nombre,
            codigo: "N/A",
          };
        } else if (matchingCompanyMain) {
          // If found in companyNames, use that company
          matchingCompany = matchingCompanyMain;
        } else {
          // Default fallback
          matchingCompany = {
            nombre: currentCarga.destino,
            codigo: currentCarga.codigo_espejo,
          };
        }

        setSelectedCompany(matchingCompany);
      } else {
        setSelectedCompany(null);
      }
    } else {
      setInputValue("");
      setSelectedCompany(null);
    }
  }, [currentCarga]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newData = {
      transporte: capitalizeWords(document.getElementById("transporte").value),
      destino: inputValue.toUpperCase(),
      estadoDestino: document.getElementById("estadoDestino").value,
      codigo_espejo: selectedCompany?.codigo || "N/A",
    };

    guardar(proveedor, cargaActual, "/datosG3", newData);
  };

  const handleEmpresaInput = (e) => {
    const value = e.target.value.toLowerCase().trim();
    const searchWords = value.split(/\s+/); // Split input into words

    const filtered = companyNames.filter((company) =>
      searchWords.every((word) => company.nombre.toLowerCase().includes(word))
    );

    // Filter sinCodigo list using the same logic
    const filteredSinCodigo = sinCodigo.filter((company) =>
      searchWords.every((word) => company.nombre.toLowerCase().includes(word))
    );

    // Combine both filtered lists
    setSuggestions([...filtered, ...filteredSinCodigo]);

    // Only set selectedCompany to null if the input doesn't match any company from either list
    if (
      !filtered.some(
        (company) => company.nombre.toLowerCase() === value.toLowerCase()
      ) &&
      !filteredSinCodigo.some(
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
            placeholder="Ej.: Mercal"
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
                placeholder="Escribe el nombre de la empresa"
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
              Código espejo:{" "}
              {Number(selectedCompany.codigo) < 100
                ? "N/A"
                : selectedCompany.codigo}
            </p>
          )}

          {/****** Estado destino *****/}
          <label htmlFor="estadoDestino">Estado destino: </label>
          <input
            type="text"
            id="estadoDestino"
            defaultValue={
              currentCarga?.estadoDestino || currentCarga?.codigo_espejo || ""
            }
            placeholder="Ej.: Distrito Capital"
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
