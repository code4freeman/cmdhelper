/**
 * 命令定义示例 
 */

const cmd = require("./index");
const parseDescript = require("./lib/parseDescript");

const descripts = [
    "<--d, description> number 123 版本",    
    "<-o, output> string 指定输出目录",
    "[-e, exclude] string 指定"
]

console.log(parseDescript(descripts[0]));