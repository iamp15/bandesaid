/* eslint-disable react/prop-types */
import { PROVIDER_MAP } from "../../constants/constants";
import { useNavigate } from "react-router-dom";
import BotonCopiar from "../BotonCopiar";
import { GALPON, RUBRO } from "../../constants/constants";

const ControlCalidad2 = ({
  cargas,
  proveedor,
  cargaActual,
  setCargaActual,
}) => {
  const mapeo = PROVIDER_MAP[proveedor];
  const infoCarga = cargas[mapeo]?.[cargaActual - 1] || {};
  const navigate = useNavigate();

  const paredes = () => {
    switch (infoCarga.paredes) {
      case "1":
        return "Las paredes y el techo se encuentran limpios y en buen estado";
      case "2":
        return "Las paredes y el techo se encuentran limpios pero en mal estado";
      case "3":
        return "Las paredes y el techo se encuentran limpios pero con algunas manchas";
      case "4":
        return "Las paredes y el techo están manchados y deteriorados";
      case "5":
        return "No posee paredes ni techo por tratarse de un vehículo abierto";
      default:
        return "Estado de paredes y techo no especificado";
    }
  };

  const genFormato = () => {
    const numeracion = () => {
      if (cargaActual < 10) return `0${cargaActual}`;
      else return `${cargaActual}`;
    };

    const genObservacion = () => {
      const paletas =
        infoCarga.paletas === "Si"
          ? "con paletas, por lo que la proteína no estará en contacto directo con el suelo"
          : "sin paletas, por lo que la proteína estará en contacto directo con el suelo";

      const tk = () => {
        if (infoCarga.tk === "Si")
          return "El Thermo King se encuentra operativo";
        if (infoCarga.tk === "No")
          return "El Thermo King no se encuentra operativo";
        if (infoCarga.tk === "No posee") return "No posee Thermo King";
      };
      const olor = () => {
        if (infoCarga.olor === "fresco") return "fresco característico";
        else return `a ${infoCarga.otroOlor}`;
      };

      return `Vehículo ${paletas}. ${paredes()}. ${tk()}. El vehículo posee un olor ${olor()}. En planta se encuentra el representante de ${
        infoCarga.entidad
      }, ${
        infoCarga.responsable
      }, quien se hace responsable de las condiciones de la carga.`;
    };

    return (
      "*INSPECCION DE VEHICULO* 👀\n" +
      `*CARGA Nº ${numeracion()}:*\n` +
      `*Proveedor:* ${infoCarga.proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Thermo King:* ${infoCarga.tk}\n` +
      `*Fecha:* ${infoCarga.fecha}\n` +
      `*Motivo:* Inicio de Carga\n` +
      `\n*Observación:* ${genObservacion()}`
    );
  };

  const handleInicio = () => {
    setCargaActual(0);
    navigate("/carga");
  };

  return (
    <div className="wrap-container">
      <div className="menu">
        <div className="section">
          <h2>Inspección de vehículo</h2>
          <p>
            Thermo King: <span className="value">{infoCarga.tk}</span>
          </p>
          <p>
            Paletas: <span className="value">{infoCarga.paletas}</span>
          </p>
          <p>
            Olor:{" "}
            <span className="value">
              {infoCarga.olor === "fresco"
                ? "Fresco característoco"
                : infoCarga.otroOlor}
            </span>
          </p>
          <p>
            Paredes y techo: <span className="value">{paredes()}</span>
          </p>
          <p>
            Entidad: <span className="value">{infoCarga.entidad}</span>
          </p>
          <p>
            Responsable: <span className="value">{infoCarga.responsable}</span>
          </p>
        </div>
        <BotonCopiar text1={genFormato()} text2="Copiar formato" />
        <div className="button-group">
          <button onClick={() => navigate("/cc1")}>Volver</button>
          <button onClick={handleInicio}>Inicio</button>
        </div>
      </div>
    </div>
  );
};

export default ControlCalidad2;
