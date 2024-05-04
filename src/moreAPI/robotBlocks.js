// 连接口琴机器人
; (function () {
    if (window.LexicalVariables == undefined) return;    // Web Serial API 前提是有LexicalVariable插件
    if (typeof robotSerial == undefined) return;

    // 机器人控制相关 全局变量
    window.robot = new robotSerial(115200, 1);

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
        },
        {
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
        },
    ];
    // 消息定义
    Blockly.Msg["CATKQROBOT"] = "口琴机器人";
    Blockly.Msg["KQROBOT_NOTE"] = "音域%1音符%2";
    Blockly.Msg["KQROBOT_PLAY"] = "演奏音符%1";

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
            },
            {
                "kind": "block",
                "type": "kqrobot_play"
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