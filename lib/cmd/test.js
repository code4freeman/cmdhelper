/**
 * 命令定义示例 
 */

const parseDescript = require("./lib/parseDescript");
const cmdparse = require("./lib/cmdparser");
const cmd = require("./index");

const descripts = [
    "[-d, description number 1231232123412341234  地方官史蒂夫就好急啊水",    
    "<-o, output> string 指定输出目录",
    "[-e, exclude] string 指定"
]

console.log(cmdparse());