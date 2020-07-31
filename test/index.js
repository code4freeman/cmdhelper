const { cmd } = require("../index");

cmd("copy", [
    "[-n, name]> string lilin  姓名",
], params => {
    console.log(params);
});