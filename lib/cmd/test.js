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
const params = cmd("mv", ["<-v, version> number 版本号"]);
if (params) {
    console.log("(0):");
    console.log(params);
}

//使用方式2
// cmd(descripts, params => {
//     console.log("(1):");
//     console.log(params);
// });


// cmd("copy", descripts, params => {
//     console.log("(2):");
//     console.log(params);
// });

