function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatSeconds(seconds) {
    return seconds.toFixed(1).replace(".", ",") + " mp";
}


export { randomInt, formatSeconds };
