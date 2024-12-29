/* eslint-disable react/prop-types */

const NumPrecintos = ({ num, onPrecintoNumberChange, precintos }) => {
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
            defaultValue={precintos[index]}
            maxLength={8}
            required
          />
        </div>
      ))}
    </div>
  );
};

export default NumPrecintos;
