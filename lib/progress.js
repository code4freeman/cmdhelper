"use strict"

module.exports = function (length = 20) {
    let isDone = false;
    return {step, done};
    function render (step = 0, texts = []) {
        if (step >= 100) isDone = true;
        let str = `[ ${buildFillStr(step, length)} ] `;
        str += texts.map(i => `${i} `);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        process.stdout.write(str);
    }
    function step (step = 1, texts = []) {
        if (isDone) return;
        render(...arguments);
    }
    function done (texts = []) {
        if (isDone) return;
        render(100, texts);
    }
}

function buildFillStr (step, length) {
    let 
    num = Math.floor(step / 100 * length),
    left = length - num,
    str = "", 
    spacing = "";
    for (let i = 0; i < num; i++) {
        str += "=";
    }
    for (let i = 0; i < left; i++) {
        spacing += " ";
    }
    return str + spacing;
}