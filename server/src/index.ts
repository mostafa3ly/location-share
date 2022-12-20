import { createServer } from 'http';

const port = 8000;
// Spinning the http server and the websocket server.
const server = createServer();
server.listen(port);
console.log(`listening on port ${port}`);