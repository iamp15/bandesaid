/* eslint-disable react/prop-types */
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";

const BotonCopiar = ({ text1, text2 }) => {
  const [showNotification, setShowNotification] = useState(false);

  const handleCopy = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000); // Hide after 2 seconds
  };

  return (
    <div className="copy-button-container">
      <CopyToClipboard text={text1} onCopy={handleCopy}>
        <button>{text2}</button>
      </CopyToClipboard>
      {showNotification && (
        <div className="notification">¡Formulario copiado!</div>
      )}
    </div>
  );
};

export default BotonCopiar;
