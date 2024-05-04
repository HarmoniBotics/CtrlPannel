'use strict';

var Blockly = Blockly || { Msg: Object.create(null) };

Blockly.Msg["CATCONTROL"] = "控制";
Blockly.Msg["CATLOGIC"] = "逻辑";
Blockly.Msg["CATMATH"] = "数学";
Blockly.Msg["CATTEXT"] = "文本";
Blockly.Msg["CATLISTS"] = "列表";
Blockly.Msg["CATDICTIONARIES"] = "字典";
Blockly.Msg["CATCOLOUR"] = "颜色";
Blockly.Msg["CATVARIABLES"] = "变量";
Blockly.Msg["CATFUNCTIONS"] = "函数";

Blockly.Msg["CONTROLS_PRINT"] = "输出到控制台";
Blockly.Msg["CONTROLS_ALERT"] = "弹窗消息";
Blockly.Msg["CONTROLS_RUNJS"] = "运行JavaScript";
Blockly.Msg["CONTROLS_TYPEOF"] = "%1的类型";
Blockly.Msg["CONTROLS_IGNORE_RETURN"] = "忽略返回值%1";
Blockly.Msg["CONTROLS_DELAY"] = "延时%1毫秒";
Blockly.Msg["CONTROLS_TIMEOUT"] = "%1毫秒后";
Blockly.Msg["CONTROLS_ASYNC_DO"] = "异步执行%1";
Blockly.Msg["CONTROLS_INTERVAL"] = "每隔%1毫秒";
Blockly.Msg["CONTROLS_CLEAR_CLK"] = "清除计时%1";
Blockly.Msg["LISTS_ISARRAY"] = "是否为列表";
Blockly.Msg["LISTS_PUSH"] = "在列表%1尾部插入";
Blockly.Msg["LISTS_SORT_DIY"] = "排序%1自定义规则%2";
Blockly.Msg["LISTS_CONCAT"] = "连接列表";
Blockly.Msg["DICTIONARIES_CONCAT"] = "合并字典";
Blockly.Msg["LISTS_SPLICE"] = "于列表%1位置%2删除元素数目%3并添加如下元素";
Blockly.Msg["PROCEDURE_GET"] = "取过程 过程名%1";
Blockly.Msg["PROCEDURE_CALL_BY_NAME"] = "执行过程%1参数列表%2";