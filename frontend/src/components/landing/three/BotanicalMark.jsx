function BotanicalMark({
    className = "",
  }) {
    return (
      <div
        className={`botanical-mark ${className}`}
        aria-hidden="true"
      >
        <span className="botanical-stem" />

        <span className="leaf leaf-1" />
        <span className="leaf leaf-2" />
        <span className="leaf leaf-3" />
        <span className="leaf leaf-4" />
        <span className="leaf leaf-5" />
      </div>
    );
  }

  export default BotanicalMark;