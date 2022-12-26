import timeout from "./timeout.mjs";
import drawer from "./drawer.mjs";
import picker from "./picker.mjs";

document.querySelector("#start").addEventListener("submit", e => {
    e.preventDefault();
    main(new FormData(e.currentTarget).get("apiKey"));
    document.querySelector(".container").classList.add("ready");
});

const main = apiKey => {
    const ws = connect(apiKey);
    ws.addEventListener("message", messageEvent => {
        let data = JSON.parse(messageEvent.data)
        console.log(data);
        console.log(data.payload.place);
        if (data.type === 'startPlace') drawer.putArray(data.payload.place)
        else if (data.type === 'updateInServerPlace') drawer.put(data.payload.x, data.payload.y, data.payload.color);
    });

    timeout.next = new Date();
    drawer.onClick = (x, y) => {
        ws.send(JSON.stringify({
            type: 'updatePlace',
            payload: {
                x,
                y,
                color: picker.color
            }
        }));
    };
};

const connect = apiKey => {
    const url = `${location.origin.replace(/^http/, "ws")}?apiKey=${apiKey}`;
    return new WebSocket(url);
};