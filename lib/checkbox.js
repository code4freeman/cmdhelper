"use strict"

const rl = require("readline");

const keyPressState = {
    EXIT: "EXIT",
    ENTER: "ENTER",
    SPACE: "SPACE",
    UP: "UP",
    DOWN: "DOWN"
}

module.exports = function (
    title = "多选框(空格选择/取消选择,回车确认)：",
    options = [],
    cb
) {
    let index = 0, checkeds = [], writeStr = "";
    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on("data", onData);
    render();
    if (!cb) {
        return new Promise((resolve) => {
            cb = resolve;
        });
    }
    function onData (chunk) {
        switch(getKeypressType(chunk)) {
            case keyPressState.EXIT:
                process.exit();
            break;
            case keyPressState.UP:
                change(keyPressState.UP);
                render();
            break;
            case keyPressState.DOWN:
                change(keyPressState.DOWN);
                render();
            break;
            case keyPressState.SPACE:
                select(index);
                render();
            break;
            case keyPressState.ENTER:
                process.stdin.setRawMode(false);
                process.stdin.removeListener("data", onData);
                process.stdin.pause();
                cb(options.filter((item, index) => checkeds[index]));
        }
        
    }
    function change (dir) {
        if (dir === keyPressState.UP) {
            if (index === 0) index = options.length - 1;
            else index --;
        }
        if (dir === keyPressState.DOWN) {
            if (index === options.length - 1) index = 0;
            else index ++;
        }
    }
    function select (index){
        if (checkeds[index]) checkeds[index] = false;
        else checkeds[index] = true;
    }
    function render () {
        let str = title + "\n"
        for (let i = 0; i < options.length; i++) {
            const { label } = options[i];
            str += `${index === i ? ">" : " "}`;
            str += `[${checkeds[i] ? "*" : " "}] ${label}\n`;
        }
        if (writeStr) {
            rl.moveCursor(process.stdout, 0, -(writeStr.split("\n").length - 1));
            rl.clearScreenDown(process.stdout);
            process.stdout.write(str);
        } else {
            process.stdout.write(str);
        }
        writeStr = str;
    }
}

function getKeypressType (buf) {
    // console.log(buf);
    if (buf.readUInt8(0) === 0x20 && buf.byteLength === 1) {
        return keyPressState.SPACE;
    }
    if (buf.byteLength == 1 && buf.readUInt8(0) === 0x03) {
        return keyPressState.EXIT;
    }
    if (buf.byteLength === 3 && buf.readUInt8(0) === 0x1b && buf.readUInt8(1) === 0x5b && buf.readUInt8(2) === 0x41) {
        return keyPressState.UP;
    }
    if (buf.byteLength === 3 && buf.readUInt8(0) === 0x1b && buf.readUInt8(1) === 0x5b && buf.readUInt8(2) === 0x42) {
        return keyPressState.DOWN;
    }
    if (buf.byteLength === 1 && buf.readUInt8(0) === 0x0d) {
        return keyPressState.ENTER;
    }
}