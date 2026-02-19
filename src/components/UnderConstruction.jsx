const UnderConstruction = () => {
  return (
    <>
      <div>Sitio en construcción... 👷‍♀</div>
      <button className="button-group" onClick={() => window.history.back()}>
        Volver
      </button>
    </>
  );
};

export default UnderConstruction;
