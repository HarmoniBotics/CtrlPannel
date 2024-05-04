// Web Serial API 相关
; (function () {
    if (window.LexicalVariables == undefined) return;    // Web Serial API 前提是有LexicalVariable插件
    // 用json定义块
    const serialBlocks = [
        {
            "type": "serial_get",
            "message0": "%{BKY_SERIAL_GET}",
            "output": "Serial",
            "style": "serial_blocks",
            "tooltip": "navigator.serial.requestPort();",
            "JavaScript": function (block, generator) {
                return ['await navigator.serial.requestPort()', generator.ORDER_NONE];
            }
        },
        {
            "type": "serial_disconnect",
            "message0": "%{BKY_SERIAL_DISCONNECT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Serial",
                    "check": "Serial"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "serial_blocks",
            "tooltip": "port.close()",
            "JavaScript": function (block, generator) {
                let serial = generator.valueToCode(block, 'Serial', generator.ORDER_ATOMIC);
                return `{\n  let tempserial = ${serial};\n  tempserial.reader.releaseLock();\n  await tempserial.close();\n}\n`;
            }
        },
        {
            "type": "serial_send",
            "message0": "%{BKY_SERIAL_SEND}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Serial",
                    "check": "Serial",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "data",
                    "check": "Array",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "serial_blocks",
            "tooltip": "数据可以传列表，可以传字符串\n最终发送的数据都将化为Uint8Array\n必须先打开该串口",
            "JavaScript": function (block, generator) {
                let serial = generator.valueToCode(block, 'Serial', generator.ORDER_ATOMIC);
                let data = generator.valueToCode(block, 'data', generator.ORDER_ATOMIC);
                return `{ // SerialSend start\n  const writer = ${serial}.writable.getWriter();\n` +
                    `  await writer.write(typeof ${data}=='string' ? new TextEncoder().encode(${data}) : new Uint8Array(${data}));\n` +
                    "  writer.releaseLock();\n} // SerialSend over\n"
            }
        }
    ];
    // 消息定义
    Blockly.Msg["CATSERIAL"] = "串口";
    Blockly.Msg["SERIAL_GET"] = "获取串口";
    Blockly.Msg["SERIAL_CONNECT_1"] = "打开串口%1校验位%2";
    Blockly.Msg["SERIAL_CONNECT_2"] = "波特率%1停止位长度%2收到消息%3时";
    Blockly.Msg["SERIAL_CONNECT_DO"] = "执行%1";
    Blockly.Msg["SERIAL_DISCONNECT"] = "关闭串口%1";
    Blockly.Msg["SERIAL_SEND"] = "串口%1发送列表/字符串%2";

    Blockly.defineBlocksWithJsonArray(serialBlocks);
    // 代码生成器
    for (const block of serialBlocks) {
        Blockly.JavaScript.forBlock[block['type']] = block['JavaScript'];
    }

    // 用js定义带lexicalVariable变量的块
    Blockly.Blocks['serial_connect'] = {
        init: function () {
            this.jsonInit({
                "message0": "%{BKY_SERIAL_CONNECT_1}",
                "args0": [
                    {
                        "type": "input_value",
                        "name": "Serial",
                        "check": "Serial",
                        "align": "RIGHT"
                    }, {
                        "type": "field_dropdown",
                        "name": "Parity",
                        "options": [
                            ["无校验", "none"],
                            ["奇校验", "odd"],
                            ["偶校验", "even"]
                        ],
                        "align": "RIGHT"
                    },
                ],
                "message1": "%{BKY_SERIAL_CONNECT_2}",
                "args1": [
                    {
                        "type": "input_value",
                        "name": "BaudRate",
                        "check": "Number",
                        "align": "RIGHT"
                    }, {
                        "type": "input_value",
                        "name": "Stop",
                        "check": "Number",
                        "align": "RIGHT"
                    }, {
                        "type": "field_parameter_flydown",  // 查lexicalVariable插件的filed定义的fromJson函数可知传参
                        "name": "VAR",
                        "text": "data",     // 此字段是我修改了lexicalVariables的源码
                        "is_editable": true
                    }
                ],
                "message2": "%{BKY_SERIAL_CONNECT_DO}",
                "args2": [
                    {
                        "type": "input_statement",
                        "name": "DO"
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "style": "serial_blocks",
                "tooltip": "port.open(options)",
                "inputsInline": false
            });
        },
        referenceResults: function (name, prefix, env) {
            let Shared = LexicalVariables.Shared;
            let loopVar = this.getFieldValue('VAR');
            if (Shared.usePrefixInCode)
                loopVar = (Shared.possiblyPrefixMenuNameWith(Shared.loopRangeParameterPrefix))(loopVar);
            const newEnv = env.concat([loopVar]);
            let referenceResult = LexicalVariables.LexicalVariable.referenceResult;
            const serialResults = referenceResult(
                this.getInputTargetBlock('Serial'), name, prefix, env);
            const rateResults = referenceResult(
                this.getInputTargetBlock('BaudRate'), name, prefix, env);
            const parityResults = referenceResult(
                this.getInputTargetBlock('Parity'), name, prefix, env);
            const stopResults = referenceResult(
                this.getInputTargetBlock('Stop'), name, prefix, env);
            const doResults = referenceResult(
                this.getInputTargetBlock('DO'), name, prefix, newEnv);
            const nextResults = referenceResult(
                LexicalVariables.LexicalVariable.getNextTargetBlock(this), name, prefix, env);
            return [serialResults, rateResults, parityResults, stopResults, doResults, nextResults];
        },
        withLexicalVarsAndPrefix: Blockly.Blocks['controls_forRange'].withLexicalVarsAndPrefix,
        getVars: Blockly.Blocks['controls_forRange'].getVars,
        renameVar: Blockly.Blocks['controls_forRange'].renameVar,
        blocksInScope: Blockly.Blocks['controls_forRange'].blocksInScope,
        declaredNames: Blockly.Blocks['controls_forRange'].declaredNames,
        renameBound: function (boundSubstitution, freeSubstitution) {
            let renameFree = LexicalVariables.LexicalVariable.renameFree;
            renameFree(this.getInputTargetBlock('Serial'), freeSubstitution);
            renameFree(this.getInputTargetBlock('BaudRate'), freeSubstitution);
            renameFree(this.getInputTargetBlock('Parity'), freeSubstitution);
            renameFree(this.getInputTargetBlock('Stop'), freeSubstitution);
            const oldIndexVar = this.getFieldValue('VAR');
            const newIndexVar = boundSubstitution.apply(oldIndexVar);
            if (newIndexVar !== oldIndexVar) {
                this.renameVar(oldIndexVar, newIndexVar);
                const indexSubstitution = LexicalVariables.Substitution.simpleSubstitution(oldIndexVar, newIndexVar);
                const extendedFreeSubstitution = freeSubstitution.extend(indexSubstitution);
                renameFree(this.getInputTargetBlock('DO'), extendedFreeSubstitution);
            } else {
                const removedFreeSubstitution = freeSubstitution.remove([oldIndexVar]);
                renameFree(this.getInputTargetBlock('DO'), removedFreeSubstitution);
            }
            if (this.nextConnection) {
                const nextBlock = this.nextConnection.targetBlock();
                renameFree(nextBlock, freeSubstitution);
            }
        },
        renameFree: Blockly.Blocks['controls_forRange'].renameFree,
        freeVariables: function () { // return the free variables of this block
            const freeVariables = LexicalVariables.LexicalVariable.freeVariables;
            const result = freeVariables(this.getInputTargetBlock('DO'));
            // Remove bound index variable from body free vars
            result.deleteName(this.getFieldValue('VAR'));
            result.unite(freeVariables(this.getInputTargetBlock('Serial')));
            result.unite(freeVariables(this.getInputTargetBlock('BaudRate')));
            result.unite(freeVariables(this.getInputTargetBlock('Parity')));
            result.unite(freeVariables(this.getInputTargetBlock('Stop')));
            if (this.nextConnection) {
                const nextBlock = this.nextConnection.targetBlock();
                result.unite(freeVariables(nextBlock));
            }
            return result;
        }
    };
    Blockly.JavaScript.forBlock['serial_connect'] = function (block, generator) {
        const serial = generator.valueToCode(block, 'Serial', generator.ORDER_ATOMIC);
        const baudrate = generator.valueToCode(block, 'BaudRate', generator.ORDER_ATOMIC);
        const parity = block.getFieldValue('Parity');
        const stop = generator.valueToCode(block, 'Stop', generator.ORDER_ATOMIC);
        const data = generator.nameDB_.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
        const onGet = generator.statementToCode(block, 'DO');
        return `{ // SerialConnect start\nlet tempSerial = ${serial};\nawait tempSerial.open({baudRate:${baudrate},parity:"${parity}",stopBits:${stop}});\n` +
            "(async function(){\n  tempSerial.reader = tempSerial.readable.getReader();\n" +
            "  try {\n    while (true) {\n" +
            `      let ${data} = await tempSerial.reader.read();\n` +
            `      if (${data}.done) break;\n      ${data} = ${data}.value;\n` +
            `      ${onGet}    }\n` +
            "  } catch(e) {\n    console.log(e);\n  } finally {\n    tempSerial.reader.releaseLock();\n    tempSerial.close();\n  }\n})();\n} // SerialConnect over\n";
    }

    // 插入toolbox
    if (toolbox.contents.length == 10) {     // 加一条分界线，以区分基本库和扩展库
        toolbox.contents.push({
            "kind": "sep"
        });
    }
    toolbox.contents.push({
        "kind": "category",
        "name": "%{BKY_CATSERIAL}",
        "categorystyle": "serial_category",
        "contents": [
            {
                "kind": "block",
                "type": "serial_get"
            },
            {
                "kind": "block",
                "type": "serial_connect",
                "inputs": {
                    "BaudRate": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "9600"
                            }
                        }
                    },
                    "Stop": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "1"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "serial_send"
            },
            {
                "kind": "block",
                "type": "serial_disconnect"
            },
        ],
        "categorystyle": "serial_category"
    });
    // 主题配置
    Blockly.Themes.Custom.blockStyles['serial_blocks'] = {
        'colourPrimary': "#970BF4",
        'colourSecondary': "#a0a0a0",
        'colourTertiary': "#C87DF9"
    };
    Blockly.Themes.Custom.categoryStyles['serial_category'] = {
        'colour': "#970BF4"
    };
})();