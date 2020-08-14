const { loading } = require("../index");

let { stop, info } = loading("稍等");
setTimeout(() => {
    stop("end");
}, 10000);
setTimeout(() => {
    info("加水电费环环紧扣");
}, 5000);