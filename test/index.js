const { cmd } = require("../index");

cmd([
    "<-a, age>  number 年纪",
    "<-n, name> string 姓名",
], function () {
    console.log(arguments);
});