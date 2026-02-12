export default function App() {
  return (
    <div className="h-screen text-white bg-red-500 electrobun-webkit-app-region-drag">
      <div
        className="flex items-center justify-center h-full electrobun-webkit-app-region-no-drag"
        onMouseDown={(e) => {
          // makes dragging only for the background rather than the content inside
          if (e.target !== e.currentTarget) e.stopPropagation();
        }}
      >
        <h1 className="w-5/6 h-5/6 rounded-full bg-green-300 text-center flex items-center justify-center">
          <span className="text-xl font-bold text-black">hello world</span>
        </h1>
      </div>
    </div>
  );
}
