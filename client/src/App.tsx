import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { w3cwebsocket } from "websocket";
import { Event, EventType } from "./types/event";
import "./App.css";

const client = new w3cwebsocket("ws://127.0.0.1:8000");

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      const data = message.data;
      if (typeof data === "string") {
        setUsers(JSON.parse(data));
      }
    };
    client.onclose = () => {
      console.log("closed");
    };
    return () => client.close();
  }, []);

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handleConnect = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const name = username.trim();
    if (!name.length) return;
    const event: Event = { type: EventType.login, payload: username };
    client.send(JSON.stringify(event));
    setIsLoggedIn(true);
  };

  const handleLogout = (): void => {
    const event: Event = { type: EventType.logout, payload: username };
    client.send(JSON.stringify(event));
    setUsername("");
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <form onSubmit={handleConnect}>
          <input
            placeholder="Username"
            onChange={handleChangeUsername}
            value={username}
          />
          <button type="submit">Connect</button>
        </form>
      ) : (
        <div>
          <button onClick={handleLogout}>Disconnect</button>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {Object.entries(users).map(([id, username]) => (
              <li key={id}>
                <p>{username}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
