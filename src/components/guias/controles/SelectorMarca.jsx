/* eslint-disable react/prop-types */

import { MARCA } from "../../../constants";

const SelectorMarca = ({ chickenBrand, onChange }) => {
  return (
    <>
      <p>Marca de Pollo: </p>
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
    </>
  );
};

export default SelectorMarca;
