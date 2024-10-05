/* eslint-disable react/prop-types */

const NumPrecintos = ({
  num,
  cargas,
  mapeo,
  cargaActual,
  onPrecintoNumberChange,
}) => {
  const currentPrecintos = cargas[mapeo][cargaActual - 1].precintos || [];

  return (
    <div>
      {[...Array(Number(num))].map((_, index) => (
        <div key={index}>
          <label htmlFor={`precinto-${index}`}>
            Número de precinto {index + 1}:{" "}
          </label>
          <input
            type="text"
            id={`precinto-${index}`}
            onChange={(e) => onPrecintoNumberChange(index, e.target.value)}
            defaultValue={currentPrecintos[index]}
            maxLength={8}
            pattern="\d{8}"
            title="El número de precinto debe tener 8 dígitos"
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumPrecintos;
