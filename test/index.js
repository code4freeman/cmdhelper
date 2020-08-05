const { cmd } = require("../index");

cmd([
    "[-n, name] string lilin  `姓名`",
], params => {
    console.log(params);
});