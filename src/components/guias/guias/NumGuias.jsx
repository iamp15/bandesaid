/* eslint-disable react/prop-types */

const NumGuias = ({ num, cargas, mapeo, cargaActual, onGuideNumberChange }) => {
  const currentCodigos = cargas[mapeo][cargaActual - 1].codigos_guias || [];

  return (
    <div>
      {[...Array(Number(num))].map((_, index) => (
        <div key={index}>
          <label htmlFor={`guia-${index}`}>Número de guía {index + 1}: </label>
          <input
            type="text"
            id={`guia-${index}`}
            onChange={(e) => onGuideNumberChange(index, e.target.value)}
            defaultValue={currentCodigos[index]}
            maxLength={9}
            pattern="\d{9}"
            title="Ingrese un número de guía válido (9 dígitos)"
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumGuias;
