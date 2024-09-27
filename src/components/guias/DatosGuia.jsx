const DatosGuia = () => {
  const text = () => {
    const carga = 1;
    const empresa = "Toro Rojo";
    const galpon = "Súper Pollo Carrizal";
    const rubro = "Pollo";
    const montoGuia = "3.000,00";
    const montoVerificado = "3.001,10";
    const NumGuia = "154688856";
    const marca = "San José";
    const pesoProm = "2,02";
    const tempProm = "-4,9";
    const estadoDestino = "Distrito Capital";
    const entidadDestino = "PDVAL Distrito Capital";

    return (
      "*DATOS DE LA GUIA 🧾*" +
      "\n" +
      "*Carga Nº " +
      carga +
      ":*" +
      "\n" +
      "*Empresa:* " +
      empresa +
      "\n" +
      "*Galpón:* " +
      galpon +
      "\n" +
      "*Rubro:* " +
      rubro +
      "\n" +
      "*Monto según guía:* " +
      montoGuia +
      "\n" +
      "*Monto verificado:* " +
      montoVerificado +
      "\n" +
      "*Número de guía:* " +
      NumGuia +
      "\n" +
      "*Marca:* " +
      marca +
      "\n" +
      "*Números de lotes:* N/A" +
      "\n" +
      "*Fecha de Elaboración:* N/A" +
      "\n" +
      "*Fecha de Vencimiento:* N/A" +
      "\n" +
      "*Peso promedio:* " +
      pesoProm +
      " kg" +
      "\n" +
      "*Temperatura promedio:* " +
      tempProm +
      " °C" +
      "\n" +
      "*CND o CPE:* 072249161" +
      "\n" +
      "*Permiso sanitario:* MIR-TIPO-I-000415086" +
      "\n" +
      "*Estado destino:* " +
      estadoDestino +
      "\n" +
      "*Entidad destino:* " +
      entidadDestino
    );
  };

  return <div>DatosGuia</div>;
};

export default DatosGuia;
