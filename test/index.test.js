const cmdhelper = require("../index");
const cmd = require("../lib/cmd");

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

    it("测试加载动画：", done => {
        const stop = cmdhelper.loading("请稍等");
        setTimeout(() => {
            stop("加载动画停止");
            done();
        }, 5000);
    }).timeout(60 * 1000);

    it("测试进度条：", done_ => {
        const {
            done,
            step
        } = cmdhelper.progress(50);
        let 
        index = 0,
        t = setInterval(() => {
            index ++;
            if (index >= 100) {
                done(["恭喜您，下载完成！"]);
                clearInterval(t);
                done_();
            } else {
                step(index, [`当前进度：${index}%`, "不要慌，很快的"]);
            }
        }, 200);
    }).timeout(60 * 1000);

    it ("问题测试", done => {
        cmdhelper.question("请随意输入，按回车确定", res => {
            console.log("您输入的是：" + res);
            done();
        });
    }).timeout(60 * 1000);

    it("多选测试", done => {
        cmdhelper.checkbox(
            "选择你喜欢的零食(空格键选择/取消选择，回车键确定)：",
            [
                {label: "奥利奥"},
                {label: "卫龙辣条"},
                {label: "养乐多"},
                {label: "大波浪薯片"}
            ],
            res => {
                console.log("您选择的是：");
                res.forEach(i => console.log(i));
                done();
            }
        );
    }).timeout(60 * 1000);

});