import { Link } from "react-router-dom";
import "../styles/Menu.css";
import despachoIcon from "../media/iconos/despachos.png";
import inventarioIcon from "../media/iconos/baul-inventario.png";
import formatoIcon from "../media/iconos/formato.png";
import configIcon from "../media/iconos/config.png";
import { useAuth } from "./login/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const Menu = () => {
  const { currentUser, loading } = useAuth();

  // If loading, show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

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
      link: "/underconstruction",
    },
    {
      id: 3,
      title: "Otros formatos",
      image: formatoIcon,
      link: "/selectorformatos",
    },
    {
      id: 4,
      title: "Configuración",
      image: configIcon,
      link: "/underconstruction",
    },
  ];

  return (
    <div className="menu-wrapper">
      <div className="menu-header">
        <p className="menu-date">
          {currentUser
            ? `Bienvenid@, ${currentUser.name} ${currentUser.lastname}.`
            : "Cargando..."}
        </p>
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
