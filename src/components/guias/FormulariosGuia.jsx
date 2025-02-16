/* eslint-disable react/prop-types */
import BotonCopiar from "../BotonCopiar";
import { useNavigate } from "react-router-dom";
import {
  PROVIDER_MAP,
  GALPON,
  RUBRO,
  PERMISO_SANITARIO,
  LOTE,
} from "../../constants/constants";
import "../../styles/guias/formulariosGuia.css";
import { formatNumber } from "../../utils/FormatNumber";
import { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner";

const FormulariosGuia = ({
  proveedor,
  cargaActual,
  setCargaActual,
  cargas,
}) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1];
  const numGuias = infoCarga?.codigos_guias.length || 1;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have all required data
    if (infoCarga?.codigos_guias && infoCarga?.precintos) {
      setIsLoading(false);
    }
  }, [infoCarga]);

  if (isLoading) {
    return (
      <div className="wrap-container">
        <div className="menu">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  const generateGuiaText1 = (index) => {
    const numeracion = () => {
      if (numGuias === 1 && cargaActual < 10) return `0${cargaActual}`;
      if (numGuias === 1 && cargaActual >= 10) return `${cargaActual}`;
      else return `${cargaActual}.${index + 1}`;
    };

    const choosePeso = () => {
      if (numGuias > 1) return infoCarga?.pesos_guias[index];
      else return infoCarga?.p_total;
    };

    const parseLocalizedNumber = (stringNumber) => {
      // Remove thousands separators and replace decimal comma with period
      const normalizedNumber = stringNumber
        .replace(/\./g, "")
        .replace(",", ".");
      return Number(normalizedNumber);
    };

    const choosePesoVerificado = () => {
      if (numGuias === 1) {
        return infoCarga.p_verificado;
      }

      if (numGuias > 1) {
        if (index < numGuias - 1) {
          // Not the last guide
          return infoCarga.pesos_guias[index];
        } else {
          // Last guide
          const sumPreviousWeights = infoCarga.pesos_guias
            .slice(0, -1)
            .reduce((sum, weight) => sum + parseLocalizedNumber(weight), 0);
          const totalVerified = parseLocalizedNumber(infoCarga.p_verificado);
          const remainingWeight = totalVerified - sumPreviousWeights;
          return formatNumber(remainingWeight);
        }
      }
      return 0; // Default return if none of the conditions are met
    };

    return (
      "*DATOS DE LA GUIA* 🧾\n" +
      `*Carga Nº ${numeracion()}:*\n` +
      `*Empresa:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Monto según Guía:* ${choosePeso()} kg\n` +
      `*Monto verificado:* ${choosePesoVerificado()} kg\n` +
      `*Número de Guía:* ${infoCarga?.codigos_guias[index]}\n` +
      `*Marca:* ${infoCarga?.marca_rubro}\n` +
      `*Números de lotes:* ${infoCarga.lote}\n` +
      `*Fecha de Elaboración:* ${LOTE.elaboracion}\n` +
      `*Fecha de Vencimiento:* ${LOTE.vencimiento}\n` +
      `*Peso promedio:* ${infoCarga.p_promedio} kg\n` +
      `*Temperatura:* ${infoCarga.t_promedio} ºC\n` +
      `*CND o CPE:* ${infoCarga.cnd}\n` +
      `*Permiso Sanitario:* ${PERMISO_SANITARIO}\n` +
      `*Estado destino:* ${infoCarga.estadoDestino}\n` +
      `*Entidad destino:* ${infoCarga.destino}\n` +
      `🆔: ${infoCarga.id_despacho}`
    );
  };

  const generateGuiaText2 = (index) => {
    if (numGuias === 1) return "Datos de la guía";
    else return `Datos de la guía ${cargaActual}.${index + 1}`;
  };

  const generateActaText2 = (index) => {
    if (numGuias === 1) return "Acta de responsabilidad";
    else return `Acta de responsabilidad ${cargaActual}.${index + 1}`;
  };

  const generateDatosVehiculo = () => {
    const numeracion = () => {
      if (cargaActual < 10) return `0${cargaActual}`;
      else return `${cargaActual}`;
    };

    return (
      "*DATOS DEL VEHÍCULO* 🚚\n" +
      `*Carga Nº ${numeracion()}:*\n` +
      `*Empresa:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Número de Guía:* ${infoCarga?.codigos_guias.join("/")}\n` +
      `*Thermo King operativo:* ${infoCarga.tk}\n` +
      `*Transporte:* ${infoCarga.transporte}\n` +
      `*Nombre del chofer:* ${infoCarga.chofer}\n` +
      `*Cédula de identidad del chofer:* ${infoCarga.cedula}\n` +
      `*Placa del vehículo:* ${infoCarga.placa}\n` +
      `*Número de precintos:* ${infoCarga.precintos.join("/")}\n` +
      `*Marca del vehículo:* ${infoCarga.marcaVehiculo}\n`
    );
  };

  const generateActaResponsabilidad = (index) => {
    const numeracion = () => {
      if (numGuias === 1 && cargaActual < 10) return `0${cargaActual}`;
      if (numGuias === 1 && cargaActual >= 10) return `${cargaActual}`;
      else return `${cargaActual}.${index + 1}`;
    };

    return (
      "*ACTA DE RESPONSABILIDAD*\n" +
      `*CARGA Nº ${numeracion()}*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Guía Sada Nro:* ${infoCarga?.codigos_guias[index]}\n` +
      `*Fecha:* ${infoCarga.fecha}`
    );
  };

  const generateSaliendoPlanta = () => {
    const numeracion = () => {
      if (cargaActual < 10) return `0${cargaActual}`;
      else return `${cargaActual}`;
    };
    return (
      `*CARGA Nº ${numeracion()}*\n` +
      `*Empresa:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Producto:* ${RUBRO}\n` +
      `*Fecha:* ${infoCarga.fecha}\n` +
      `*Destino:* ${infoCarga.destino}\n\n` +
      " *SALIENDO DE PLANTA*"
    );
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <h4>Selecciona el formato a copiar:</h4>
        {[...Array(numGuias)].map((_, index) => (
          <BotonCopiar
            key={index}
            text1={generateGuiaText1(index)}
            text2={generateGuiaText2(index)}
          />
        ))}
        <BotonCopiar
          text1={generateDatosVehiculo()}
          text2="Datos del vehículo"
        />
        {[...Array(numGuias)].map((_, index) => (
          <BotonCopiar
            key={index}
            text1={generateActaResponsabilidad(index)}
            text2={generateActaText2(index)}
          />
        ))}
        <BotonCopiar
          text1={generateSaliendoPlanta()}
          text2="Saliendo de planta"
        />

        <div className="button-group">
          <button onClick={() => navigate("/revisionguias")}>Volver</button>
          <button
            onClick={() => {
              setCargaActual(0);
              navigate("/carga");
            }}
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulariosGuia;
