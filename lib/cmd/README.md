# 参数声明模板语法

## 必选参数声明

必选不能声明默认值

 <-d, description> string  指定原路径
  ^^     ^^           ^^    ^^
  标签  在params中key  类型   描述

## 可选参数声明

可选可以声明默认值

[-d, description] string default    描述文本
 ^^     ^^          ^^     ^^          ^^
 标签名  在parm中key 类型    必选默认值   描述文本

## 选项声明

只有可选的选项声明才可以省略类型和默认值

[--v, version]                   查看当前版本 
  ^^     ^^     ^^      ^^         ^^
  flag  key    类型可选  默认值可选   描述文本
