"use strict"

// const defaultChars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏".split("");
const defaultChars = "∵∴".split("");

module.exports = function (text = "", chars = defaultChars, duration = 150) {
    if (!process.stdout.isTTY) throw "process.stdin 不是TTY";
    const nextChar = stateLoop(chars);
    const timer = setInterval(() => { 
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        process.stdout.write(text + " " + nextChar() + " ");
    }, duration);
    return function (text) {
        clearInterval(timer);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(0);
        console.log(text);
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