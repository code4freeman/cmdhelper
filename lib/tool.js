"use strict"

const { WriteStream } = require("tty");

/**
 * "isTTY" hack
 * 
 * 原本的tty自带的isTTY貌似有点问题，重新看了下tty的文档，遂改之。  
 * 
 * @ref https://nodejs.org/docs/latest/api/tty.html#tty
 * 
 * `
 *  When Node.js detects that it is being run with a text terminal ("TTY") attached, process.stdin will, by default, be initialized as an instance of tty.ReadStream and both process.stdout and process.stderr will, by default, be instances of tty.WriteStream. 
 * `
 * 
 * @returns {Boolean}
 */
exports.isTTY = () => process?.stdout && (process.stdout instanceof WriteStream);
