/**
 * 命令定义示例 
 */

 const cmd = require("./index");

const descripts = [
    "<-d, description> string 指定原路径",    
    "<-o, output> string 指定输出目录",
    "[-e, exclude] string 指定"
]

//使用方式1
// cmd(null, descripts, (...args) => {
//     console.log(args);
// });

//使用方式2
cmd("copy", descripts);


