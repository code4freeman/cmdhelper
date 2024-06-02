"use strict"

const { isTTY } = require("./tool");
const rl = require("readline");

const defaultOptions = [
    {label: "确定"},
    {label: "取消"}
];

module.exports = function (title = "请选择：", options = defaultOptions, cb) {
    if (!title || typeof title !== "string") throw "title 不能缺失，且只能为string类型";
    if (!options || !Array.isArray(options)) throw "options不能缺失，且只能为array！";
    if (cb && typeof cb !== "function") throw "cb 只能为function";
    if (cb) {
        select(...arguments);
    } else {
        return new Promise((resolve, reject) => {
            select(title, options, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }
}

function select (title, options, cb) {
    let 
    writeStr = "",
    index = 0;
    if (!isTTY()) {
        cb(new Error("process.stdin 不是 TTY"));
        return;
    }
    render(options, index);
    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on("data", onData);
    function onData (chunk) {
        switch (getKeyType(chunk)) {
            case "exit":
                process.exit();
                break;
            case "up":
                changeIndex("up");
                render();
                break;
            case "down":
                changeIndex("down");
                render();
                break;
            case "enter":
                cb(null, options[index]);
                process.stdin.setRawMode(false);
                process.stdin.removeListener("data", onData);
                process.stdin.pause();
                break;
       } 
    }
    function changeIndex (dir) {
        const hub = {
            up () {
                if (index === 0) {
                    index = options.length - 1;
                } else {
                    index --;
                }
            },
            down () {
                if (index === options.length - 1) {
                    index = 0;
                } else {
                    index ++;
                }
            }
        }
        hub[dir]();
    }
    function render () {
        let str = title ? title + "\n" : "";
        for (let i = 0; i < options.length; i++) {
            str += `[${i === index ? "*" : " "}] ${options[i].label}\n`;
        }
        if (writeStr) {
            rl.moveCursor(process.stdout, 0, -(writeStr.split("\n").length - 1));
            rl.clearScreenDown(process.stdout);
            process.stdout.write(str);
            writeStr = str;
        } else {
            process.stdout.write(str);
            writeStr = str;
        }
    }
}

function getKeyType (buf) {
    if (buf.byteLength == 1 && buf.readUInt8(0) === 0x03) {
        return "exit";
    }
    if (buf.byteLength === 3 && buf.readUInt8(0) === 0x1b && buf.readUInt8(1) === 0x5b && buf.readUInt8(2) === 0x41) {
        return "up";
    }
    if (buf.byteLength === 3 && buf.readUInt8(0) === 0x1b && buf.readUInt8(1) === 0x5b && buf.readUInt8(2) === 0x42) {
        return "down";
    }
    if (buf.byteLength === 1 && buf.readUInt8(0) === 0x0d) {
        return "enter";
    }
}