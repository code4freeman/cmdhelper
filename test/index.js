const { cmd } = require("../index");
const h = require("../index");

cmd([
    "[--v, version] `版本号`",
    "[--h, help] `帮助`"
], params => {
    if (Object.keys(params).length === 0) {
        console.log("欢迎使用sdtree！");
    }
    else if (params.version !== undefined) {
        console.log("当前版本 v0.0.1");
    } 
    else if (params.help !== undefined) {
        console.log("更多帮助详见 https://github.com/lilindog/sdtree");
    }
});

cmd("copy", [

], params => {
    const stop = h.loading("扫描中");
    setTimeout(() => {
        stop("完成！");
    }, 2000);
});