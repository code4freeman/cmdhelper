"use strict"

module.exports = function (questionMessage = "", cb) {
    process.stdin.resume();
    if (cb) {
        process.stdout.write(questionMessage + "\n> ");
        process.stdin.on("data", onData);
        function onData (chunk) {
            process.stdin.pause()
            process.stdin.removeListener("data", onData);
            cb(chunk.toString());
        }
    } else {
        return new Promise((resolve, reject) => {
            process.stdout.write(questionMessage + "\n> ");
            process.stdin.on("data", onData);
            function onData (chunk) {
                process.stdin.pause();
                process.stdin.removeListener("data", onData);
                resolve(chunk.toString());
            }
        });
    }
}