let nextRefresh = new Date();

const timeout = {
  set next(utcDate) {
    if (utcDate instanceof Date) {
      nextRefresh = utcDate;
    }
    if (typeof utcDate === "number" || typeof utcDate === "string") {
      nextRefresh = new Date(utcDate);
    }
  }
};

const element = document.querySelector("#timer");
window.setInterval(() => {
  const differenceInSeconds = Math.floor(
    (nextRefresh.valueOf() - Date.now()) / 1000
  );
  if (differenceInSeconds > 0) {
    const timespan = new Date(0, 0, 0, 0, 0, differenceInSeconds);
    element.innerHTML = timespan.toLocaleTimeString();
  } else {
    element.innerHTML = "";
  }
}, 1000);

export default timeout;
