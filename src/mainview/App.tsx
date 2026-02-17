export default function App() {
  return (
    <div className="h-screen text-white electrobun-webkit-app-region-drag">
      <div className="flex items-center justify-center h-full">
        <div className="w-full aspect-square flex items-center justify-center relative">
          <img
            src="views://mainview/assets/egg.svg"
            alt="egg"
            className="absolute inset-0 w-full h-full pointer-events-none object-contain"
          />

          <div
            className="absolute left-[20%] right-[20%] top-[25%] bottom-[25%] bg-neutral-600 rounded-xl electrobun-webkit-app-region-no-drag flex items-center justify-center"
            onMouseDown={(e) => {
              // keep dragging restricted to outside of this rectangle
              if (e.target !== e.currentTarget) e.stopPropagation();
            }}
          >
            <img
              src="views://mainview/assets/eggbert.png"
              alt="eggbert"
              className="w-4/5 h-4/5 object-contain"
              draggable={false}
            />
          </div>

          <h1 className="absolute bottom-[12%] left-0 right-0 text-center font-fredoka font-bold text-2xl text-white select-none electrobun-webkit-app-region-no-drag pointer-events-none">
            planagotchi
          </h1>
        </div>
      </div>
    </div>
  );
}
