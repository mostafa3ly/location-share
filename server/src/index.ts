import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { connection, server as websocketServer } from 'websocket';
import { Event, EventType } from './types/event';
import { User } from './types/user';

const port = 8000;

const httpServer = createServer();
httpServer.listen(port);
console.log(`listening on port ${port}`);

const wsServer = new websocketServer({ httpServer });
const clients: Record<string, connection> = {};
const users: User[] = [];

const sendMessage = (json: string) => {
    Object.keys(clients).map((client) => {
        clients[client].sendUTF(json);
    });
}

const updateLocation = (uid: string, location: { lat: number, long: number }): void => {
    const index = users.findIndex(({ id }) => uid === id);
    users[index] = { ...users[index], location }
}

const removeUser = (uid: string): void => {
    const index = users.findIndex(({ id }) => uid === id);
    users.splice(index, 1)
}

wsServer.on('request', function (request) {
    const uid = uuidv4();
    console.log("Connection started " + uid);

    const connection = request.accept(null, request.origin);
    clients[uid] = connection;

    connection.on("close", () => {
        console.log("Connection closed " + uid);
        delete clients[uid];
        removeUser(uid);
        sendMessage(JSON.stringify(users));
    });

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            const { payload, type } = JSON.parse(message.utf8Data) as Event;
            switch (type) {
                case EventType.login:
                    const username = payload.trim();
                    if (username.length) {
                        users.push({ id: uid, location: { lat: 0, long: 0 }, username });
                        console.log(username + " logged in");
                    }
                    break;
                case EventType.logout:
                    removeUser(uid);
                    console.log(payload + " logged out");
                    break;

                case EventType.location:
                    const location = payload.split(",");
                    updateLocation(uid, { lat: +location[0], long: +location[1] });
                    break;
                default:
                    break;
            }
            sendMessage(JSON.stringify(users));
        }
    })
});
