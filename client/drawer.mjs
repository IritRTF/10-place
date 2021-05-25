const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const size = 256;
const scale = 4;

let callback = () => void 0;

const drawer = {
  put(x, y, color) {
    ctx.fillStyle = color || "white";
    ctx.fillRect(x * scale, y * scale, scale, scale);
    ctx.fillStyle = "white";
  },

  putArray(colors) {
    for (const [index, color] of colors.entries()) {
      drawer.put(index % size, Math.floor(index / size), color);
    }
  },

  set onClick(f) {
    callback = f;
  }
};

canvas.addEventListener("click", e => {
  const realX = Math.floor(e.offsetX / scale);
  const realY = Math.floor(e.offsetY / scale);
  callback(realX, realY);
});

window.drawer = drawer;

export default drawer;
