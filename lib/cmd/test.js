/**
 * 命令定义示例 
 */

const cmd = require("./index");
const parseDescript = require("./lib/parseDescript");

const descripts = [
    "<--s, strict> 使用严格模式",    
    "<-o, output> string 指定输出目录",
]

cmd(descripts, cb => {
    console.log(cb);
});