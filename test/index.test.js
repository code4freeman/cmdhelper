const cmdhelper = require("../index");

describe("cmdhelper 测试用例：", () => {
    it("select 测试：", done => {
        cmdhelper.select("选择测试选项:", [
            {label: "测试选项1"},
            {label: "测试选项2"},
            {label: "测试选项3"},
            {label: "测试选项4"},
        ], (err, res) => {
            if (res.label && typeof res.label === "string") {
                console.log("您选择了：" + res.label);
                done();
            }
        });  
    }).timeout(60 * 1000);
    it ("confirm 测试", done => {
        !async function () {
            const res = await cmdhelper.confirm("确定or取消？", {confirmText: "我确定", cancelText: "算了，我取消"});
            if (typeof res === "boolean") {
                console.log("您选择了：" + res);
                done();
            }
        }();
    }).timeout(60 * 1000);
});