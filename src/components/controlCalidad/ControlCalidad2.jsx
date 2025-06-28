import { useNavigate } from "react-router-dom";
import BotonCopiar from "../BotonCopiar";
import { GALPON, RUBRO } from "../../constants/constants";
import { useEstados } from "../../contexts/EstadosContext";
import LoadingSpinner from "../LoadingSpinner";

const ControlCalidad2 = () => {
  const { setCargaActual, cargaActual, proveedor, currentCarga } = useEstados();
  const navigate = useNavigate();

  if (!proveedor || !cargaActual) {
    navigate("/despachos");
  }

  if (!currentCarga || !currentCarga.id) return <LoadingSpinner />;

  const paredes = () => {
    switch (currentCarga.paredes) {
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
        currentCarga.paletas === "Si"
          ? "con paletas, por lo que la proteína no estará en contacto directo con el suelo"
          : "sin paletas, por lo que la proteína estará en contacto directo con el suelo";

      const tk = () => {
        if (currentCarga.tk === "Si")
          return "El Thermo King se encuentra operativo";
        if (currentCarga.tk === "No")
          return "El Thermo King no se encuentra operativo";
        if (currentCarga.tk === "No posee") return "No posee Thermo King";
      };
      const olor = () => {
        if (currentCarga.olor === "fresco") return "fresco característico";
        else return `a ${currentCarga.otroOlor}`;
      };
      const puertaLateral = () => {
        if (currentCarga.puertaLateral === "Si")
          return " Posee puerta lateral.";
        else return "";
      };

      return `Vehículo ${paletas}. ${paredes()}. ${tk()}.${puertaLateral()} El vehículo posee un olor ${olor()}. En planta se encuentra el representante de ${
        currentCarga.transporte
      }, ${
        currentCarga.responsable
      }, quien se hace responsable de las condiciones de la carga.`;
    };

    return (
      "*INSPECCIÓN DE VEHÍCULO* 👀\n" +
      `*CARGA Nº ${numeracion()}:*\n` +
      `*Proveedor:* ${proveedor}\n` +
      `*Galpón:* ${GALPON}\n` +
      `*Rubro:* ${RUBRO}\n` +
      `*Thermo King:* ${currentCarga.tk}\n` +
      `*Fecha:* ${currentCarga.fecha}\n` +
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
            Thermo King: <span className="value">{currentCarga.tk}</span>
          </p>
          <p>
            Paletas: <span className="value">{currentCarga.paletas}</span>
          </p>
          <p>
            Olor:{" "}
            <span className="value">
              {currentCarga.olor === "fresco"
                ? "Fresco característico"
                : currentCarga.otroOlor}
            </span>
          </p>
          <p>
            Paredes y techo: <span className="value">{paredes()}</span>
          </p>
          <p>
            Puerta lateral:{" "}
            <span className="value">{currentCarga.puertaLateral}</span>
          </p>

          <p>
            Entidad: <span className="value">{currentCarga.transporte}</span>
          </p>
          <p>
            Responsable:{" "}
            <span className="value">{currentCarga.responsable}</span>
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
