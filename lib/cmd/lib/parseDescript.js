"use strict"

module.exports = parseDescript;

function parseDescript (str = "") {
    const res = {
        required: false,
        key: "",
        subkey: "",
        type: null,
        summary: "",
        raw: str
    }
    const state = {
        FIELD: "FIELD",
        TYPE: "TYPE",
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
            }
            else if (chars[0] === ",") {
                if (/^-[a-z]+$/g.test(char)) {
                    res.key = char.replace("-", "");
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
            else if (chars[0] === ">" || chars[0] === "]") {
                if (/^[a-z]+$/.test(char)) {
                    res.subkey = char;
                } else {
                    error();
                }
                shift();
                break;
            }
            else {
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
            if (/[a-z]/i.test(chars[0])) {
                char += shift();
            }
            else if (chars[0] === " ") {
                if (!allows.includes(char)) error();
                res.type = char;
                break;
            }
            else {
                error();
            }
        }
        currentState = state.SUM;
    }
    function handleSUM () {
        let char = "";
        trim();
        while (true) {
            if (chars[0] !== undefined && chars[0] !== " ") {
                char += shift();
            }
            else {
                res.summary = char;
                break;
            }
        }
        currentState = state.END;
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
        throw `descript 语法错误：\n\n${str}\n${spacing + "^"}`;
    }
    function trim () {
        while(chars[0] === " ") shift();
    }
}

