/* eslint-disable react/prop-types */
import { CopyToClipboard } from "react-copy-to-clipboard";
const BotonCopiar = ({ text1, text2 }) => {
  return (
    <CopyToClipboard text={text1} onCopy={() => console.log("Copied!")}>
      <button>{text2}</button>
    </CopyToClipboard>
  );
};

export default BotonCopiar;
