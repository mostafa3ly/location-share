import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';
import { connection, server as websocketServer } from 'websocket';

const port = 8000;
// Spinning the http server and the websocket server.
const httpServer = createServer();
httpServer.listen(port);
console.log(`listening on port ${port}`);

const wsServer = new websocketServer({ httpServer });
const clients: Record<string, connection> = {};

wsServer.on('request', function (request) {
    const uid = uuidv4();
    console.log("User connected with uuid " + uid);

    const connection = request.accept(null, request.origin);
    clients[uid] = connection;

    connection.on("close", () => {
        console.log("User disconnected with uuid " + uid);
        delete clients[uid];
    });

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ', message.utf8Data);
        }
    })
});
