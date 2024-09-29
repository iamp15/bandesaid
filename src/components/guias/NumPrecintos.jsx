/* eslint-disable react/prop-types */

const NumPrecintos = ({ num, setPrecintos, cargas, mapeo, cargaActual }) => {
  const handleInputChange = (index, value) => {
    setPrecintos((prevPrecintos) => {
      const newPrecintos = [...prevPrecintos];
      newPrecintos[index] = value;
      return newPrecintos;
    });
  };

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
            onChange={(e) => handleInputChange(index, e.target.value)}
            defaultValue={currentPrecintos[index]}
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumPrecintos;
