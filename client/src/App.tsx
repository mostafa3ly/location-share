import { useEffect } from "react";
import { w3cwebsocket } from "websocket";
import "./App.css";

const client = new w3cwebsocket("ws://127.0.0.1:8000");

function App() {
  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      console.log(message);
    };
    client.onclose = () => {
      console.log("closed");
    };
    return () => client.close();
  });

  return <div className="App"></div>;
}

export default App;
