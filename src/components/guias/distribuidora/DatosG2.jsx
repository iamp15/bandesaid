/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useGuardar } from "../../../hooks/useGuardar";
import { PROVIDER_MAP } from "../../../constants/constants";
import { useState, useEffect } from "react";
import { capitalizeWords } from "../../../utils/Capitalizer";
import "../../../styles/guias/DatosG2.css";
import { codigos_espejo as companyNames } from "../../../constants/CodigosEspejo";
import { sinCodigo } from "../../../constants/Sincodigo";
import EditableField from "../../EditableField";
import { useAuth } from "../../login/AuthContext";
import LoadingSpinner from "../../LoadingSpinner";
import { useNavigate } from "react-router-dom";

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
  const { currentUser, loading } = useAuth();
  const [onEdit, setOnEdit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentCarga) {
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
      setSelectedCompany(null);
    }
  }, [currentCarga]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onEdit !== null) {
      alert("Por favor, guarda los cambios antes de continuar");
      return;
    }

    const newData = {
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

  const handleFieldSave = (fieldName, newValue) => {
    const newData = {
      [fieldName]: newValue,
      editHistory: {
        ...currentCarga?.editHistory,
        [fieldName]: {
          value: newValue,
          editedBy: currentUser.name,
          editedAt: new Date().toISOString(),
        },
      },
    };
    guardar(proveedor, cargaActual, "", newData);
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <form onSubmit={handleSubmit}>
          <h2>Comercializadora: </h2>

          {/****** Entidad destino *****/}
          <div className="empresa-input-container">
            <div className="dropdown-container">
              <EditableField
                fieldName="destino"
                label="Entidad destino"
                value={currentCarga?.destino}
                onSave={handleFieldSave}
                editHistory={currentCarga?.editHistory}
                onChange={(e) => {
                  handleEmpresaInput(e);
                  setShowSuggestions(true);
                }}
                suggestions={suggestions} // Pass suggestions
                showSuggestions={showSuggestions} // Pass showSuggestions
                setShowSuggestions={setShowSuggestions} // Pass setShowSuggestions
                placeholder="Escribe el nombre de la empresa"
                autoComplete={"off"}
                setOnEdit={setOnEdit}
                onEdit={onEdit}
              />
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

          {/****** Nombre empresa transporte *****/}
          <EditableField
            fieldName="transporte"
            label="Nombre de empresa que transporta"
            value={currentCarga?.transporte}
            placeholder="Ej.: Mercal"
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
          />

          {/****** Estado destino *****/}
          <EditableField
            fieldName="estadoDestino"
            label="Estado destino"
            value={currentCarga?.estadoDestino}
            onSave={handleFieldSave}
            currentUser={currentUser}
            editHistory={currentCarga?.editHistory}
            formatValue={capitalizeWords}
            setShowSuggestions={setShowSuggestions}
            setOnEdit={setOnEdit}
            onEdit={onEdit}
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
