/* eslint-disable react/prop-types */

const NumGuias = ({ num, setCodigos, cargas, mapeo, cargaActual }) => {
  const handleInputChange = (index, value) => {
    setCodigos((prevCodigos) => {
      const newCodigos = [...prevCodigos];
      newCodigos[index] = value;
      return newCodigos;
    });
  };

  const currentCodigos = cargas[mapeo][cargaActual - 1].codigos_guias || [];

  return (
    <div>
      {[...Array(Number(num))].map((_, index) => (
        <div key={index}>
          <label htmlFor={`guia-${index}`}>Número de guía {index + 1}: </label>
          <input
            type="text"
            id={`guia-${index}`}
            onChange={(e) => handleInputChange(index, e.target.value)}
            defaultValue={currentCodigos[index]}
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumGuias;
