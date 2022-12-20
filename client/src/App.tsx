import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { w3cwebsocket } from "websocket";
import { Event, EventType } from "./types/event";
import "./App.css";
import { User } from "./types/user";

const client = new w3cwebsocket("ws://127.0.0.1:8000");

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const sendLocation = useCallback((position: GeolocationPosition) => {
    const event: Event = {
      payload: position.coords.latitude
        .toString()
        .concat(",", position.coords.longitude.toString()),
      type: EventType.location,
    };
    client.send(JSON.stringify(event));
  }, []);

  useEffect(() => {
    let id = 0;

    if (navigator.geolocation) {
      id = navigator.geolocation.watchPosition((position) => {
        console.log("changed", position.coords.latitude);

        sendLocation(position);
      });
    }

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [sendLocation]);

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
      console.log("WebSocket Client closed");
    };
    return () => client.close();
  }, []);

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const name = username.trim();
    if (!name.length) return;
    const event: Event = { type: EventType.login, payload: username };
    client.send(JSON.stringify(event));
    setIsLoggedIn(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        sendLocation(position);
      });
    }
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
        <form onSubmit={handleLogin}>
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
            {users.map((user) => (
              <li key={user.id}>
                <p>
                  {user.username}: {user.location.lat}, {user.location.long}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
