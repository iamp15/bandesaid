/* eslint-disable react/prop-types */

const NumPrecintos = ({ num, setPrecintos }) => {
  const handleInputChange = (index, value) => {
    setPrecintos((prevCodigos) => {
      const newCodigos = [...prevCodigos];
      newCodigos[index] = value;
      return newCodigos;
    });
  };

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
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumPrecintos;
