import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { connection, server as websocketServer } from 'websocket';
import { Event, EventType } from './types/event';

const port = 8000;
// Spinning the http server and the websocket server.
const httpServer = createServer();
httpServer.listen(port);
console.log(`listening on port ${port}`);

const wsServer = new websocketServer({ httpServer });
const clients: Record<string, connection> = {};
const users: Record<string, string> = {};

wsServer.on('request', function (request) {
    const uid = uuidv4();
    console.log("Connection started " + uid);

    const connection = request.accept(null, request.origin);
    clients[uid] = connection;

    connection.on("close", () => {
        console.log("Connection closed " + uid);
        delete clients[uid];
        delete users[uid];
    });

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            const { payload, type } = JSON.parse(message.utf8Data) as Event;
            switch (type) {
                case EventType.login:
                    const username = payload.trim();
                    if (username.length) {
                        users[uid] = username;
                        console.log(username + " logged in");
                    }
                    break;
                case EventType.logout:
                    delete users[uid];
                    console.log(payload + " logged out");
                    break;

                default:
                    break;
            }
        }
    })
});
