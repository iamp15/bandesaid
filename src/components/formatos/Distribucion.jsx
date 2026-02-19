import { useState } from "react";
import BotonCopiar from "../BotonCopiar";
import { formatDate } from "../../utils/FormatDate";
import { useNavigate } from "react-router-dom";

const Distribucion = () => {
  const initialInspectores = [
    "Igor Martínez",
    "Betcy Bastidas",
    "Karla Rondón",
    "Whyleiner Arismendi",
    "Pedro Montilla",
  ];

  const [sustitutos, setSustitutos] = useState(["Eduwin Olaya"]);

  const [inspectores, setInspectores] = useState(initialInspectores);
  const navigate = useNavigate();

  const rotateInspectores = () => {
    // Rotate the array
    const newInspectores = [...inspectores];
    const firstElement = newInspectores.pop();
    newInspectores.unshift(firstElement);
    setInspectores(newInspectores);
  };

  const swapKarlaAndEduwin = () => {
    const newInspectores = [...inspectores];
    const newSustitutos = [...sustitutos];
    const karlaIndex = newInspectores.indexOf("Karla Rondón");
    const eduwinIndex = newSustitutos.indexOf("Eduwin Olaya");

    if (karlaIndex !== -1 && eduwinIndex !== -1) {
      // Swap positions: Karla to sustitutos and Eduwin to inspectores
      [newInspectores[karlaIndex], newSustitutos[eduwinIndex]] = [
        newSustitutos[eduwinIndex],
        newInspectores[karlaIndex],
      ];
    } else {
      // Swap positions back: Eduwin to sustitutos and Karla to inspectores
      const eduwinIndexInInspectores = newInspectores.indexOf("Eduwin Olaya");
      const karlaIndexInSustitutos = newSustitutos.indexOf("Karla Rondón");

      if (eduwinIndexInInspectores !== -1 && karlaIndexInSustitutos !== -1) {
        [
          newInspectores[eduwinIndexInInspectores],
          newSustitutos[karlaIndexInSustitutos],
        ] = [
          newSustitutos[karlaIndexInSustitutos],
          newInspectores[eduwinIndexInInspectores],
        ];
      }
    }

    setInspectores(newInspectores);
    setSustitutos(newSustitutos);
  };

  const texto =
    `**Distribución del grupo para su jornada laboral**\n` +
    `**FECHA:** ${formatDate()}\n\n` +
    ` **CONTROL DE PESO:**\n\n` +
    `📌 ${inspectores[0]}\n\n` +
    ` **CONTROL DE CALIDAD - BARRIDO DEL SISTEMA:**\n\n` +
    `📌 ${inspectores[1]}\n` +
    `📌 ${inspectores[2]}\n\n` +
    ` **VERIFICACIÓN DE GUÍAS - SALIDA DE VEHÍCULOS:**\n\n` +
    `📌 ${inspectores[3]}\n\n` +
    ` **SISTEMA:**\n\n` +
    `📌 ${inspectores[4]}\n`;

  return (
    <div className="wrap-container">
      <div className="menu">
        <h2>Distribución del grupo</h2>
        <button onClick={rotateInspectores}>Rotar</button>
        <button onClick={swapKarlaAndEduwin}>Eduwin 🔄 Karla</button>
        <h3>CONTROL DE PESO</h3>
        <p>📌 {inspectores[0]}</p>
        <h3>CONTROL DE CALIDAD</h3>
        <p>📌 {inspectores[1]}</p>
        <p>📌 {inspectores[2]}</p>
        <h3>VERIFICACIÓN DE GUÍAS</h3>
        <p>📌 {inspectores[3]}</p>
        <h3>SISTEMA</h3>
        <p>📌 {inspectores[4]}</p>
        <br />
        <BotonCopiar text1={texto} text2={"Copiar formato"} />

        <div className="button-group">
          <button type="button" onClick={() => navigate("/selectorformatos")}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Distribucion;
