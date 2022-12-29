import * as path from "path";
import express from "express";
import WebSocket from "ws";

const port = process.env.PORT || 5000;

const apiKeys = new Set([
  "4a83051d-aad4-483e-8fc8-693273d15dc7",
  "c08c9038-693d-4669-98cd-9f0dd5ef06bf",
  "4b1545c4-4a70-4727-9ea1-152ed4c84ae2",
  "4a226908-aa3e-4a34-a57d-1f3d1f6cba84",
]);

const colors = [
  "#140c1c",
  "#442434",
  "#30346d",
  "#4e4a4e",
  "#854c30",
  "#346524",
  "#d04648",
  "#757161",
  "#597dce",
  "#d27d2c",
  "#8595a1",
  "#6daa2c",
  "#d2aa99",
  "#6dc2ca",
  "#dad45e",
  "#deeed6",
];

const size = 256;
// place(x, y) := place[x + y * size]
const place = Array(size * size).fill(null);
for (const [colorIndex, colorValue] of colors.entries()) {
  for (let dx = 0; dx < size; dx++) {
    place[dx + colorIndex * size] = colorValue;
  }
}

const app = express();

app.use(express.static(path.join(process.cwd(), "client")));

app.get('/api/getColors', (req, res) => {
  res.send(colors);
  res.sendStatus(200);
})

app.get("/*", (_, res) => {
  res.send("Place(holder)");
});

const server = app.listen(port);

const wss = new WebSocket.Server({
  noServer: true,
  // port: port,
});

function sendMsg(ws) {
  let msg = {
    type: "place",
    payload: {
      place: place
    }
  };
  ws.send(JSON.stringify(msg));
}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    let dataJSON = JSON.parse(data);
    if (dataJSON.type === 'click' && dataJSON.payload.x >= 0 && dataJSON.payload.y >= 0){
      place[dataJSON.payload.x + dataJSON.payload.y * size] = dataJSON.payload.color
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(dataJSON));
        }
      })
    }
  });
  sendMsg(ws);
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, req.headers.origin);
  console.log(url);
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});
