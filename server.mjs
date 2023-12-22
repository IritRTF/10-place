import * as path from "path";
import express from "express";
import WebSocket from "ws";
import { log } from "console";

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
const place = Array(size * size).fill(null);
for (const [colorIndex, colorValue] of colors.entries()) {
  for (let dx = 0; dx < size; dx++) {
    place[dx + colorIndex * size] = colorValue;
  }
}

const app = express();

const addPoint = (payload) => {
  const { x, y, color } = payload;
  if (!colors.includes(color)) throw 'Unknown color';
  if (x < 0 || x >= size || y < 0 || y >= size) throw 'Unknown coords';
  place[x + y * size] = color;
  return { x, y, color };
}


const ACTIONS = {
  getColors: () => colors,
  getPlace: () => place,
  addPoint: addPoint,
}

const BROADCAST_ACTIONS = ['addPoint'];

const makeMessage = (type, payload) => {
  const res = { type };
  try {
    if (!type || !(type in ACTIONS)) throw 'Unknown action type';
    res.payload = ACTIONS[type](payload);
  } catch (payload) {
    res.type = 'error';
    res.payload = payload;
  }
  return JSON.stringify(res);
}

const server = app.listen(port);

const wss = new WebSocket.Server({
  noServer: true,
});

app.use(express.static(path.join(process.cwd(), "client")));

app.get("/*", (_, res) => {
  res.send("Place(holder)");
});

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, req.headers.origin);
  console.log(url);
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on('connection', ws => {
  ws.on('error', console.error);
  ws.send(makeMessage('getPlace'));
  ws.on('message', msg => {
    const { type, payload } = JSON.parse(msg);
    const answer = makeMessage(type, payload);
    if (type && BROADCAST_ACTIONS.includes(type)) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(answer);
      });
    } else ws.send(answer);
  });
});