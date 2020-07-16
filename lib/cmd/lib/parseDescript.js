"use strict"

module.exports = parseDescript;

class Res {
    constructor () {
        this.required = false;
        this.isParam = false;
        this.isOption = false;
        this.flag = "";
        this.key = "";
        this.type = "";
        this.default = "";
        this.summary = "";
        this.raw = "";
    }
}

function parseDescript (str = "") {
    const res = new Res;
    res.raw = str;
    const state = {
        FIELD: "FIELD",
        TYPE: "TYPE",
        DEFAULT: "DEFAULT",
        SUM: "SUM",
        END: "END"
    }
    const chars = str.split("");
    let 
    currentState = state.FIELD,
    index = 0;
    while (chars.length) {
        switch (currentState) {
            case state.FIELD:
                handleFIELD();
                continue;
            break;
            case state.TYPE:
                handleTYPE();
                continue;
            break;
            case state.DEFAULT:
                handleDEFAULT();
                continue;
            break;
            case state.SUM:
                handleSUM();
                continue;
            break;
            case state.END:
                handleEND();
        }
    }
    return res;
    function handleFIELD () {
        let char = shift();
        res.required = char === "<" ? true : char === "[" ? false : null;
        if (res.required === null) error();
        char = "";
        trim();
        while (true) {
            if (/(-|[a-z])/i.test(chars[0])) {
                char += shift();
                if (/^--[^-]+/.test(char)) res.isOption = true, res.isParam = false; 
                if (/^-[^-]+/.test(char)) res.isParam = true, res.isOption = false;
            }
            else if (chars[0] === ",") {
                if (/^-[a-z]+$/i.test(char) || /^--[a-z]+$/i.test(char)) {
                    res.flag = char;
                } else {
                    error();
                }
                shift();
                break;
            } else {
                error();
            }
        }
        char = "";
        trim();
        while (true) {
            if (/[a-z]/.test(chars[0])) {
                char += shift();
            } 
            else if (
                (res.required && chars[0] === ">") || 
                (!res.required && chars[0] === "]")
            ) {
                if (/^[a-z]+$/.test(char)) {
                    res.key = char;
                } else {
                    error();
                }
                shift();
                break;
            }
            else {
                shift();
                error();
            }
        }
        currentState = state.TYPE;
    }
    function handleTYPE () {
        const allows = ["string", "number"];
        let char = "";
        trim();
        while (true) {
            if (chars[0] !== " " && chars[0] !== undefined) {
                char += shift();
                continue;
            }
            if (chars[0] === undefined) {
                if (res.isParam) {
                    error();
                }
                if (res.isOption) {
                    if (res.required) {
                        error();
                    }
                    res.summary = char;
                    currentState = state.END;
                    break;
                }
            }
            if (chars[0] === " ") {
                if (allows.includes(char)) {
                    res.type = char;
                    currentState = state.DEFAULT;
                    break;
                } else {
                    error();
                }
            }
        }
    }
    function handleDEFAULT () {
        if (res.required) {
            currentState = state.SUM;
            return;
        }
        let char = "";
        trim();
        while (true) {
            if (chars[0] !== " " && chars[0] !== undefined) {
                char += shift();
            }
            else if (chars[0] === " ") {
                if (/^[0-9]+$/.test(char) && "number" !== res.type) {
                    error();
                } 
                res.default = char;
                currentState = state.SUM;
                break;
            }
            else if (chars[0] === undefined){
                res.summary = char;
                currentState = state.END;
                break;
            }
        }
    }
    function handleSUM () {
        let char = "";
        trim();
        while (true) {
            if (chars[0] !== undefined && chars[0] !== " ") {
                char += shift();
                continue;
            }
            res.summary = char;
            currentState = state.END;
            break;
        }
    }
    function handleEND () {
        trim();
        if (shift() !== undefined) {
            error();
        }
    }
    function shift () {
        index ++;
        return chars.shift();
    }
    function error (offset = 0) {
        let 
        chineseCharNum = 0,
        spacing = "";
        for (let i = 0; i < index; i++) {
            if (/[\u4e00-\u9fa5]/.test(str.charAt(i))) chineseCharNum ++;
        }
        for (let i = 0; i < index + chineseCharNum; i++) {
            spacing += " ";
        }
        throw `descript 语法错误：\n\n${str}\n${spacing.slice(0, -1) + "^"}`;
    }
    function trim () {
        while(chars[0] === " ") shift();
    }
}