import { CopyToClipboard } from "react-copy-to-clipboard";
/* eslint-disable react/prop-types */

const BotonCopiar = ({ text1, text2 }) => {
  return (
    <CopyToClipboard text={text1} onCopy={() => console.log("Copied!")}>
      <button>{text2}</button>
    </CopyToClipboard>
  );
};

export default BotonCopiar;
