/**
 * 命令定义示例 
 */

const cmd = require("./index");
const parseDescript = require("./lib/parseDescript");

const descripts = [
    `[--p, port]  叫科教好久回`
]

cmd("help", descripts, params => {
    console.log(params);
});

// cmd([
//     "[-d, dir]      string   ./    指定目录",
//     "[-e, exclude]  string   .git  忽略目录与文件",
//     "[-o, output]   string   ./    log输出目录"
// ], params => {
//     console.log(params);
// });