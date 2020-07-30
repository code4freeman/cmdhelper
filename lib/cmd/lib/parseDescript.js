"use strict"

/**
 * token 类型集合 
 */
const tokenTypes = {
    LEFT_REQUIRED: "LEFT_REQUIRED",
    LEFT: "LEFT",
    TAG: "TAG",
    OPTION: "OPTION",
    COMMA: "COMMA",
    RIGHT_REQUIRED: "RIGHT_REQUIRED",
    RIGHT: "RIGHT",
    STRING: "STRING"
}

/**
 * 语法状态 
 */
class State {
    constructor () {
        this.curr= "TAG";
        this.states = {
            TAG: "TAG",
            TYPE: "TYPE",
            DEFAULT: "DEFAULT",
            SUMM: "SUMM",
            END: "END",
            ERROR: "ERROR"
        }
    }
    next (state) {
        if (state) {
            this.curr = this.states[state];
        } else {
            const keys = Object.keys(this.states);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (this.states[key] === this.curr) {
                    key = keys[i + 1];
                    this.curr = this.states[key];
                    break;
                }
            }
        }
    }
}

/**
 * 合法的数据类型集合
 */
const types = [
    "string",
    "number"
]

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

class Token {
    constructor (
        startPosition,
        endPosition,
        content,
        type
    ) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.content = content;
        this.type = type;
    }
}

/**
 * 指针索引 
 */
let INDEX = 0;

const stringReg = /^[0-9a-z\u4E00-\u9FFF]$/i;
const latterReg = /^\w$/i;

/**
 * 此法分析 
 */
function parseTokens (source) {   
    const tokens = [];
    while (INDEX < source.length) {
        skipSpacing();
        const char = source[INDEX];
        switch (check(char)) {
            case "<":
                tokens.push(new Token(INDEX, ++INDEX, char, tokenTypes["LEFT_REQUIRED"]));
                continue;
            break;
            case "[":
                tokens.push(new Token(INDEX, ++INDEX, char, tokenTypes["LEFT"]));
                continue;
            break;
            case ">":
                tokens.push(new Token(INDEX, ++INDEX, char, tokenTypes["RIGHT_REQUIRED"]));
                continue;
            break;
            case "]":
                tokens.push(new Token(INDEX, ++INDEX, char, tokenTypes["RIGHT"]));
                continue;
            break;
            case ",":
                tokens.push(new Token(INDEX, ++INDEX, char, tokenTypes["COMMA"]));
                continue;
            break;
            case "-":
                readTagOrOption();
                continue;
            break;
            case tokenTypes["STRING"]:
                readString();
                continue;
            break;
            default:
                error();
        }
    }
    return tokens;
    function readString () {
        let str = "";
        skipSpacing();
        let startIndex = INDEX;
        while (stringReg.test(source[INDEX])) {
            str += source[INDEX];
            INDEX++;
        }
        tokens.push(new Token(startIndex, INDEX, str, tokenTypes["STRING"]));
    }
    function readTagOrOption () {
        let str = "";
        let startIndex = INDEX;
        if (source[INDEX + 1] === "-") {
            INDEX += 2;
            while (latterReg.test(source[INDEX])) {
                str += source[INDEX];
                INDEX++;
            }
            tokens.push(new Token(startIndex, INDEX, "--" + str, tokenTypes["OPTION"]));
        } else {
            INDEX++;
            while (latterReg.test(source[INDEX])) {
                str += source[INDEX];
                INDEX++;
            }
            tokens.push(new Token(startIndex, INDEX, "-" + str, tokenTypes["TAG"]));
        }
    }
    function skipSpacing () {
        while (source[INDEX] === " ") {
            INDEX ++;
        }
    }
    function check (char) {
        const allowChars = ["<", "[", "-", ",", ">", "]"];
        if (allowChars.includes(char)) return char;
        if (stringReg.test(char)) {
            return tokenTypes["STRING"];
        }
    }
    function error () {
        let str = source + "\n";
        for (let i = 0; i < INDEX; i++) {
            str += " ";
        }
        str += "^";
        throw str;
    }
}

/**
 * 语法分析 
 */
function lexer (source) {
    const tokens = parseTokens(source);
    const res = new Res;
    const state = new State;
    res.raw = source;
    INDEX = 0;
    while (INDEX < tokens.length) {
        switch (state.curr) {
            case state.states.TAG:
                parseTAG();
                continue;
            break;
            case state.states.TYPE:
                parseTYPE();
                continue;
            break;
            case state.states.DEFAULT:
                parseDEFAULT();
                continue;
            break;
            case state.states.SUMM:
                parseSUMM();
                continue;
            break;
            case state.states.END:
                return res;
            case state.states.ERROR:
                error();
        }
    }
    function parseTAG () {
        for (let f of [
            () => {
                let token = tokens[INDEX];
                if (token.type === tokenTypes.LEFT) res.required = false;
                else if (token.type === tokenTypes.LEFT_REQUIRED) res.required = true;
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type === tokenTypes.TAG || token.type === tokenTypes.OPTION) {
                    res.flag = token.content;
                    token.type === tokenTypes.TAG && (res.isParam = true);
                    token.type === tokenTypes.OPTION && (res.isOption = true);
                }
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type !== tokenTypes.COMMA) state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                if (token.type === tokenTypes.STRING) res.key = token.content;
                else state.next("ERROR");
            },
            () => {
                let token = tokens[++INDEX];
                console.log(token);
                if (res.required) {
                    if (token.type !== tokenTypes.RIGHT_REQUIRED) state.next("ERROR");
                } else {
                    if (token.type !== tokenTypes.RIGHT) state.next("ERROR");
                }
            }
        ]) {
            if (state.curr === state.states.ERROR)  return;
            else f();
        }
        if (state.curr === state.states.ERROR) return state.next("ERROR");
        INDEX++;
        state.next();
    }
    function parseTYPE () {
        console.log(">>1");
        const token = tokens[INDEX];
        if (res.required) {
            if (types.includes(token.content) && token.type === tokenTypes.STRING) res.type = token.content;
            else return state.next("ERROR");
        }
        else {  
            if (types.includes(token.content) && token.type === tokenTypes.STRING) {
                res.type = token.content;
            } else {
                return state.next("SUMM");
            }
        }
        INDEX++;
        state.next();
    }
    function parseDEFAULT () {
        console.log(">>2");
        const token = tokens[INDEX];
        //可选才有默认值，并且要求type声名的情况下才能有
        if (!res.required && res.type) {
            if (token.type === tokenTypes.STRING) {
                res.default = token.content;
                INDEX++;
                return state.next();
            }
            else return state.next("ERROR");
        }
        state.next();
    }
    function parseSUMM () {
        console.log(">>3");
        const token = tokens[INDEX];
        if (token.type === tokenTypes.STRING) res.summary = token.content;
        else return state.next("ERROR");
        state.next("END");
    }
    function error () {
        throw `token 不正确："${tokens[INDEX].content}"`;
    }
}

let s = "[-a123, action] string lilin helloworld";
console.log(lexer(s));