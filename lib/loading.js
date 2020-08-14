"use strict"

// const defaultChars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏".split("");
const defaultChars = "∵∴".split("");

module.exports = function (text = "", chars = defaultChars, duration = 150) {
    if (!process.stdout.isTTY) throw "process.stdin 不是TTY";
    let infoText = "";
    const nextChar = stateLoop(chars);
    const timer = setInterval(render, duration);
    render();
    return { stop, info };
    function render () {
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        process.stdout.write(infoText ? `${nextChar()} ${infoText} ` : `${text} ${nextChar()} `);
    }
    function stop (text) {
        clearInterval(timer);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        console.log(text);
    }
    function info (text) {
        infoText = text;
    }
}

function stateLoop (chars = []) {
    let index = 0;
    return function () {
        const char = chars[index];
        index ++;
        if (index > chars.length - 1) index = 0;
        return char;
    }
}