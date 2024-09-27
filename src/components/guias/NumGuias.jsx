/* eslint-disable react/prop-types */

const NumGuias = ({ num, setCodigos }) => {
  const handleInputChange = (index, value) => {
    setCodigos((prevCodigos) => {
      const newCodigos = [...prevCodigos];
      newCodigos[index] = value;
      return newCodigos;
    });
  };

  return (
    <div>
      {[...Array(Number(num))].map((_, index) => (
        <div key={index}>
          <label htmlFor={`guia-${index}`}>Número de guía {index + 1}: </label>
          <input
            type="text"
            id={`guia-${index}`}
            onChange={(e) => handleInputChange(index, e.target.value)}
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumGuias;
