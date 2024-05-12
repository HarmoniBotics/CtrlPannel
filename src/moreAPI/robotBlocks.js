// 连接口琴机器人
; (function () {
    if (window.LexicalVariables == undefined) return;    // Web Serial API 前提是有LexicalVariable插件
    if (typeof robotSerial == undefined) return;

    // 机器人控制相关 全局变量
    window.robot = new robotSerial(115200, 1);
    window.robot.midinote2robotnote = (midinote, low=4) => {
        let octave = ((midinote / 12) | 0) - low;
        octave = Math.min(2, Math.max(octave, 0))
        let note = midinote % 12;
        let sharpMap = [0,1,0,1,0,0,1,0,1,0,1,0];
        if(sharpMap[note]) {
            note = note - 1 + 0x40;
        }
        return note | (octave<<4)
    };

    // 用json定义块
    const kqBlocks = [
        {
            "type": "kqrobot_note",
            "message0": "%{BKY_KQROBOT_NOTE}",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "Octave",
                    "options": [
                        ["低", "0"], ["中", "16"], ["高", "32"]
                    ]
                },
                {
                    "type": "field_dropdown",
                    "name": "Pitch",
                    "options": [
                        ["C", '1'], ["C#", '65'],
                        ["D", '2'], ["D#", '66'],
                        ["E", '3'], ["F", '4'],
                        ["F#", '68'], ["G", '5'],
                        ["G#", '69'], ["A", '6'],
                        ["A#", '70'], ["B", '7']
                    ]
                }
            ],
            "output" : "Number",
            "style": "kqrobot_blocks",
            "inputsInline": true,
            "tooltip": "音符映射 与midi不通用",
            "JavaScript": function (block, generator) {
                let octave = block.getFieldValue('Octave');
                let pitch = block.getFieldValue('Pitch');
                return [parseInt(octave)+parseInt(pitch), generator.ORDER_NONE];
            }
        }, {
            "type": "kqrobot_midi2",
            "message0": "%{BKY_KQROBOT_MIDI2}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "NOTE",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "LOW",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "output": "Number",
            "style": "kqrobot_blocks",
            "tooltip": "将midi音符转换为机器人的音符。最低八度一般填4(最低音为C3)或5(最低音为C4)",
            "JavaScript": function (block, generator) {
                let note = generator.valueToCode(block, 'NOTE', generator.ORDER_NONE);
                let low = generator.valueToCode(block, 'LOW', generator.ORDER_NONE);
                return [`robot.midinote2robotnote(${note},${low})`, generator.ORDER_NONE];
            }
        }, {
            "type": "kqrobot_play",
            "message0": "%{BKY_KQROBOT_PLAY}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "NOTE",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "kqrobot_blocks",
            "tooltip": "演奏一个音符",
            "JavaScript": function (block, generator) {
                let note = generator.valueToCode(block, 'NOTE', generator.ORDER_NONE);
                return `robot.note(${note});\n`;
            }
        }, {
            "type": "kqrobot_intensity",
            "message0": "%{BKY_KQROBOT_INTENSITY}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "INTENSITY",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "kqrobot_blocks",
            "tooltip": "设置强度",
            "JavaScript": function (block, generator) {
                let intensity = generator.valueToCode(block, 'INTENSITY', generator.ORDER_NONE);
                return `robot.intensity(${intensity});\n`;
            }
        },
    ];
    // 消息定义
    Blockly.Msg["CATKQROBOT"] = "口琴机器人";
    Blockly.Msg["KQROBOT_NOTE"] = "音域%1音符%2";
    Blockly.Msg["KQROBOT_MIDI2"] = "转换MIDI音符%1最低八度%2";
    Blockly.Msg["KQROBOT_PLAY"] = "演奏音符%1";
    Blockly.Msg["KQROBOT_INTENSITY"] = "设置强度%1";

    Blockly.defineBlocksWithJsonArray(kqBlocks);
    // 代码生成器
    for (const block of kqBlocks) {
        Blockly.JavaScript.forBlock[block['type']] = block['JavaScript'];
    }

    // 插入toolbox
    if (toolbox.contents.length == 10) {     // 加一条分界线，以区分基本库和扩展库
        toolbox.contents.push({
            "kind": "sep"
        });
    }
    toolbox.contents.push({
        "kind": "category",
        "name": "%{BKY_CATKQROBOT}",
        "categorystyle": "kqrobot_category",
        "contents": [
            {
                "kind": "block",
                "type": "kqrobot_note"
            }, {
                "kind": "block",
                "type": "kqrobot_midi2",
                "inputs": {
                    "LOW": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "4"
                            }
                        }
                    }
                }
            }, {
                "kind": "block",
                "type": "kqrobot_play"
            }, {
                "kind": "block",
                "type": "kqrobot_intensity"
            }
        ],
        "categorystyle": "kqrobot_category"
    });
    // 主题配置
    Blockly.Themes.Custom.blockStyles['kqrobot_blocks'] = {
        'colourPrimary': "#F4A460",
        'colourSecondary': "#a0a0a0",
        'colourTertiary': "#FFDAB9"
    };
    Blockly.Themes.Custom.categoryStyles['kqrobot_category'] = {
        'colour': "#F4A460"
    };
})();