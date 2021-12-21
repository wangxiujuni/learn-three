import { useState } from "react";
import "./App.css";
import ModelViewer from "./ModelViewer";

function App() {
  const [show, setShow] = useState(false);
  return (
    <div className="App">
      <button
        onClick={() => {
          setShow(!show);
        }}
      >
        toggle
      </button>
      {show && <ModelViewer />}
    </div>
  );
}

export default App;
