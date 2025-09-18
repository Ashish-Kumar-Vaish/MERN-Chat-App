const Nothing = ({ text, image }) => {
  return (
    <div className="h-full w-full overflow-auto">
      <div className="h-full w-full bg-[var(--app-bg)] text-[var(--inactive-text)] flex items-center justify-center text-xl font-semibold select-none">
        {text ? (
          text
        ) : (
          <img
            src={image}
            draggable="false"
            className="w-1/2 h-1/2 object-contain invert mix-blend-screen opacity-20"
          />
        )}
      </div>
    </div>
  );
};

export default Nothing;
