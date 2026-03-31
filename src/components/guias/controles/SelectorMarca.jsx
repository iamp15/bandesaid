/* eslint-disable react/prop-types */
import { useEstados } from "../../../contexts/EstadosContext";
import "../../../styles/guias/SelectorMarca.css";

const SelectorMarca = ({ chickenBrand, onChange }) => {
  const { plantaConfig } = useEstados();
  const MARCA = plantaConfig?.MARCA || {};
  return (
    <div className="radio-buttons-container">
      <p className="label-bold">Marca de Pollo: </p>
      {Object.values(MARCA).map((brand) => (
        <div key={brand.CND}>
          <label>
            <input
              type="radio"
              name="chickenBrand"
              value={brand.nombre}
              checked={chickenBrand === brand.nombre}
              onChange={onChange}
            />
            {brand.nombre}
          </label>
        </div>
      ))}
    </div>
  );
};

export default SelectorMarca;
