import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

const connect = apiKey => {
  const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
  const ws = new WebSocket(url);
  ws.onopen = e => {
    document.dispatchEvent(new CustomEvent('websocket.connection', { detail: ws }));
  }
  return ws;
};

const makeMessage = (type, payload) => {
  return JSON.stringify({ type, payload });
};

const handleMessage = (e, ws) => {
  const { type, payload } = JSON.parse(e.data);
  if (type && type in ACTIONS) ACTIONS[type](payload);
  if (type && type === 'error') console.error('Error' + (payload ? `: ${payload}` : ''));
};

const handleClick = (x, y, ws) => {
  ws.send(makeMessage('addPoint', { x, y, color: picker.color }));
};

const ACTIONS = {
  getPlace: drawer.putArray,
  addPoint: payload => drawer.put(payload.x, payload.y, payload.color),
};

const main = apiKey => {
  const ws = connect(apiKey);
  ws.addEventListener("message", e => handleMessage(e, ws));

  timeout.next = new Date();
  drawer.onClick = (x, y) => handleClick(x, y, ws);
};

document.querySelector("#start").addEventListener("submit", e => {
  e.preventDefault();
  main(new FormData(e.currentTarget).get("apiKey"));
  document.querySelector(".container").classList.add("ready");
});
