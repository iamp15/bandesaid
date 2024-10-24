/* eslint-disable react/prop-types */
import "../../../styles/guias/NumGuias.css";
import { formatNumber } from "../../../utils/FormatNumber";

const NumGuias = ({
  num,
  codigos,
  pesos,
  onGuideNumberChange,
  onGuideWeightChange,
}) => {
  console.log("NumGuias render - codigos:", codigos, "pesos:", pesos);
  return (
    <div>
      {[...Array(Number(num))].map((_, index) => (
        <div className="guia-group" key={index}>
          <label htmlFor={`guia-${index}`}>Número de guía {index + 1}: </label>
          <input
            type="text"
            id={`guia-${index}`}
            onChange={(e) => {
              console.log(`Changing guide number ${index} to:`, e.target.value);
              onGuideNumberChange(index, e.target.value);
            }}
            defaultValue={codigos[index] || ""}
            maxLength={9}
            pattern="\d{9}"
            title="Ingrese un número de guía válido (9 dígitos)"
            placeholder="Ej.: 123456789"
            required
          />
          {num > 1 && (
            <>
              <label htmlFor={`peso-${index}`}>
                Peso según guía {index + 1}:
              </label>
              <input
                type="text"
                id={`peso-${index}`}
                onChange={(e) => {
                  console.log(
                    `Direct onChange: Changing guide weight ${index} to:`,
                    e.target.value
                  );
                  onGuideWeightChange(index, e.target.value);
                }}
                defaultValue={pesos[index] ? formatNumber(pesos[index]) : ""}
                placeholder="Ej.: 5000"
                required
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default NumGuias;
