"use strict"

const state = {
    CMD: "CMD",
    NAME: "NAME",
    PARAM: "PARAM",
    OPTION: "OPTION"
}

module.exports = function (args = []) {
    if (args.length === 0) {
        args = process.argv.slice(2);
    }
    let res = {
        cmd: "",
        params: {}
    }
    let currentState = state.CMD;
    while (args.length) {
        switch (currentState) {
            case state.CMD: 
                handleCMD();
                continue;
            break;
            case state.NAME: 
                handleNAME();
                continue;
            break;
            case state.PARAM: 
                handlePARAM();
                continue;
            break;
            case state.OPTION:
                handleOPTION();
                continue;
            break;
            default: break;
        }
    }
    return res;
    function handleCMD () {
        const p = args[0];
        if (/-/g.test(p) || /--/g.test(p)) {
            currentState = state.NAME;
        } else {
            res.cmd = args.shift();
            currentState = state.NAME;
        }
    }
    function handleNAME () {
        let p = args[0];
        if (/^-[^-]+/.test(p)) {
            p = args.shift();
            const name = p.replace(/-/, "");
            res.params[name] = null;
            currentState = state.PARAM;
        } else if (/^--[^-]+/.test(p)) {
            currentState = state.OPTION;
        } else {
            throw `"${p}" 应该为参数声明, 参数声明开头应该带 "-" 或 "--"!`;
        }
    }
    function handleOPTION () {
        const p = args.shift();
        if (/^--/.test(p)) {
            if (/=/.test(p)) {
                const 
                arr = p.split("="),
                option = arr[0].replace(/-/g, "");
                res.params[option] = arr[1];
            } else {
                const option = p.replace(/-/g, "");
                res.params[option] = true;
            }
        } else {
            throw `"${p}" 选项应该为 "--" 开头，并且参数为 "--option=xx 来指定`;
        }
        currentState = state.NAME;
    }
    function handlePARAM () {
        const p = args.shift();
        if (/^-/.test(p) || /^--/.test(p)) {
            throw `"${p}" 应该为为参数，不应该为 "-" 或者 "--" 开头`;
        } else {
            for (let i of Object.keys(res.params)) {
                if (res.params[i] === null) {
                    res.params[i] = p;
                    currentState = state.NAME;
                    return;
                }
            }
            throw "内部错误";
        }
    }
}