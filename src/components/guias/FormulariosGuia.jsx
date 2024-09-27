import BotonCopiar from "../BotonCopiar";

const FormulariosGuia = () => {
  return (
    <div>
      <BotonCopiar text1={text()} text2="Datos de la guía" />
      <BotonCopiar text1="texto 2" text2="Boton 2" />
      <BotonCopiar text1="texto 3" text2="Boton 3" />
      <BotonCopiar text1="texto 4" text2="Boton 4" />
    </div>
  );
};

export default FormulariosGuia;
