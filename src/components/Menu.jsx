import { Link } from "react-router-dom";
import "../styles/Menu.css";
import despachoIcon from "../media/iconos/despachos.png";
import inventarioIcon from "../media/iconos/baul-inventario.png";
import formatoIcon from "../media/iconos/formato.png";
import configIcon from "../media/iconos/config.png";

const Menu = () => {
  const menuItems = [
    {
      id: 1,
      title: "Despachos",
      image: despachoIcon,
      link: "/despachos",
    },
    {
      id: 2,
      title: "Inventario",
      image: inventarioIcon,
      link: "",
    },
    {
      id: 3,
      title: "Otros formatos",
      image: formatoIcon,
      link: "",
    },
    {
      id: 4,
      title: "Configuración",
      image: configIcon,
      link: "",
    },
  ];

  const getCurrentDate = () => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const now = new Date();
    const dayOfWeek = days[now.getDay()];
    const dayOfMonth = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
  };

  return (
    <div className="menu-wrapper">
      <div className="menu-header">
        <p className="menu-date">{getCurrentDate()}</p>
        <p className="menu-description">Seleccione una opción para comenzar:</p>
      </div>
      <div className="menu-container">
        {menuItems.map((item) => (
          <Link to={item.link} key={item.id} className="menu-item">
            <img src={item.image} alt={item.title} className="menu-icon" />
            <span className="menu-title">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
