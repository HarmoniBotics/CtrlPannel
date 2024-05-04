// Web Serial API 相关
; (function () {
    if (typeof midi == undefined) return;    // 需要在html中引入了midi.js
    // 用json定义块
    const midiBlocks = [
        {
            "type": "midi_note",
            "message0": "%{BKY_MIDI_NOTE}",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "Pitch",
                    "options": [
                        ["-1",  '0'], ["0",   '1'],
                        ["1",   '2'], ["2",   '3'],
                        ["3",   '4'], ["4",   '5'],
                        ["5",   '6'], ["6",   '7'],
                        ["7",   '8'], ["8",   '9'],
                        ["9",  '10']
                    ]
                }, {
                    "type": "field_dropdown",
                    "name": "Note",
                    "options": [
                        ["C",  '0'],    ["C#", '1'],
                        ["D",  '2'],    ["D#", '3'],
                        ["E",  '4'],    ["F",  '5'],
                        ["F#", '6'],    ["G",  '7'],
                        ["G#", '8'],    ["A",  '9'],
                        ["A#", '10'],   ["B",  '11']
                    ]
                }
            ],
            "output": "Number",
            "style": "midi_blocks",
            "tooltip": "音高从-1到9，每级音高有音符12个。所有音符编码从0到127，因此最高为9G",
            "JavaScript": function (block, generator) {
                let pitch = parseInt(block.getFieldValue('Pitch'));
                let note = parseInt(block.getFieldValue('Note'));
                return [pitch*12+note, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_file_open",
            "message0": "%{BKY_MIDI_FILE_OPEN}",
            "output": "Array",
            "style": "midi_blocks",
            "tooltip": "打开本地midi文件",
            "JavaScript": function (block, generator) {
                let openMidiFile = generator.provideFunction_(     // 在blockly中定义一个函数
                    'openMidiFile', [
                    'const ' + generator.FUNCTION_NAME_PLACEHOLDER_ + ' = () => {',
                    '  return new Promise((resolve, reject) => {',
                    '    const fin = document.createElement("input");',
                    '    fin.type = "file";',
                    '    fin.accept = ".mid";',
                    '    fin.onchange = e => {',
                    '      var file = e.target.files[0];',
                    '      var reader = new FileReader();',
                    '      reader.readAsArrayBuffer(file);',
                    '      reader.onload = e => {',
                    '        resolve(new Uint8Array(e.target.result));',
                    '      };',
                    '    };',
                    '    fin.click();',
                    '  });',
                    '};'
                ]);
                return [`await ${openMidiFile}()`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_read",
            "message0": "%{BKY_MIDI_READ}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "MidiFile",
                    "check": "Array"
                }
            ],
            "output": "Midi",
            "style": "midi_blocks",
            "tooltip": "解析midi文件，返回midi对象",
            "JavaScript": function (block, generator) {
                let midi = generator.valueToCode(block, 'MidiFile', generator.ORDER_ATOMIC);
                return [`midi.import(${midi})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_new",
            "message0": "%{BKY_MIDI_NEW}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Name",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "bpm",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "time_signature",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "tick",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Mtrk",
                    "check": "Array",
                    "align": "RIGHT"
                }
            ],
            "output": "Midi",
            "style": "midi_blocks",
            "tooltip": "新建midi对象。速度指bpm，拍号格式为'4/4'，音轨列表为音轨对象列表，四分音符tick字面意思，一般取480",
            "JavaScript": function (block, generator) {
                let bpm = generator.valueToCode(block, 'bpm', generator.ORDER_ATOMIC);
                let time_signature = generator.valueToCode(block, 'time_signature', generator.ORDER_ATOMIC);
                time_signature = time_signature.slice(1,-1).split('/').map(x=>parseInt(x));
                let tick = generator.valueToCode(block, 'tick', generator.ORDER_ATOMIC);
                let Mtrk = generator.valueToCode(block, 'Mtrk', generator.ORDER_ATOMIC);
                let Name = generator.valueToCode(block, 'Name', generator.ORDER_ATOMIC);
                return [`new midi(${bpm},${JSON.stringify(time_signature)},${tick},${Mtrk},${Name})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_attribute",
            "message0": "%{BKY_MIDI_ATTRIBUTE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Midi",
                    "check": "Midi"
                }, {
                    "type": "field_dropdown",
                    "name": "Attribute",
                    "options": [
                        ["一个四分音符的tick数", "tick"],
                        ["音轨列表", "Mtrk"],
                        ["速度", "bpm"],
                        ["节拍", "time_signature"],
                        ["名称", "name"]
                    ]
                }
            ],
            "output": null,
            "style": "midi_blocks",
            "tooltip": "此midi的属性",
            "JavaScript": function (block, generator) {
                let midi = generator.valueToCode(block, 'Midi', generator.ORDER_ATOMIC);
                let attribute = block.getFieldValue('Attribute');
                if(attribute == 'time_signature') return [`${midi}.${attribute}.join('/')`, generator.ORDER_NONE];
                return [`${midi}.${attribute}`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_addtrack",
            "message0": "%{BKY_MIDI_ADDTRACK}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Midi",
                    "check": "Midi"
                },
                {
                    "type": "input_value",
                    "name": "Mtrk",
                    "check": "Mtrk"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "midi_blocks",
            "tooltip": "为midi添加音轨",
            "JavaScript": function (block, generator) {
                let midi = generator.valueToCode(block, 'Midi', generator.ORDER_ATOMIC);
                let mtrk = generator.valueToCode(block, 'Mtrk', generator.ORDER_ATOMIC);
                return `${midi}.addTrack(${mtrk});\n`;
            }
        },
        {
            "type": "midi_newtrack",
            "message0": "%{BKY_MIDI_NEWTRACK}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Name",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Events",
                    "check": "Array",
                    "align": "RIGHT"
                }
            ],
            "output": "Mtrk",
            "style": "midi_blocks",
            "tooltip": "新建一个音轨",
            "JavaScript": function (block, generator) {
                let Name = generator.valueToCode(block, 'Name', generator.ORDER_ATOMIC);
                let Events = generator.valueToCode(block, 'Events', generator.ORDER_ATOMIC);
                return [`new mtrk(${Name}, ${Events})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_addevent",
            "message0": "%{BKY_MIDI_ADDEVENT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Mtrk",
                    "check": "Mtrk",
                    "align": "RIGHT"
                },
                {
                    "type": "input_value",
                    "name": "Events",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "midi_blocks",
            "tooltip": "为音轨添加事件",
            "JavaScript": function (block, generator) {
                let mtrk = generator.valueToCode(block, 'Mtrk', generator.ORDER_ATOMIC);
                let events = generator.valueToCode(block, 'Events', generator.ORDER_ATOMIC);
                return `${mtrk}.addEvent(${events});\n`;
            }
        },
        //== midi事件 ==//
        {
            "type": "midi_event_note",
            "message0": "%{BKY_MIDI_EVENT_NOTE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "At",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Duration",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Note",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Intensity",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "output": "MidiEvent",
            "style": "midi_blocks",
            "tooltip": "音符事件，包括按下和弹起\n起始时刻：单位tick，为-1则自动使用最后的时间，如果为其余负数则表示在最后的时间上延迟\n音符为代码，参考midi协议，60代表C4",
            "JavaScript": function (block, generator) {
                let At = generator.valueToCode(block, 'At', generator.ORDER_ATOMIC);
                let Duration = generator.valueToCode(block, 'Duration', generator.ORDER_ATOMIC);
                let Note = generator.valueToCode(block, 'Note', generator.ORDER_ATOMIC);
                let Intensity = generator.valueToCode(block, 'Intensity', generator.ORDER_ATOMIC);
                return [`midiEvent.note(${At},${Duration},${Note},${Intensity})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_event_instrument",
            "message0": "%{BKY_MIDI_EVENT_INSTRUMENT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "At",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "Instrument",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "output": "MidiEvent",
            "style": "midi_blocks",
            "tooltip": "切换乐器事件\n起始时刻：单位tick，为-1则自动使用最后的时间，如果为其余负数则表示在最后的时间上延迟\n乐器为代码，参考midi协议",
            "JavaScript": function (block, generator) {
                let At = generator.valueToCode(block, 'At', generator.ORDER_ATOMIC);
                let Instrument = generator.valueToCode(block, 'Instrument', generator.ORDER_ATOMIC);
                return [`midiEvent.instrument(${At},${Instrument})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_event_time_signature",
            "message0": "%{BKY_MIDI_EVENT_TIME_SIGNATURE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "At",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "time_signature",
                    "check": "String",
                    "align": "RIGHT"
                }
            ],
            "output": "MidiEvent",
            "style": "midi_blocks",
            "tooltip": "改变节拍事件\n起始时刻：单位tick，为-1则自动使用最后的时间，如果为其余负数则表示在最后的时间上延迟\n拍号格式：4/4",
            "JavaScript": function (block, generator) {
                let At = generator.valueToCode(block, 'At', generator.ORDER_ATOMIC);
                let time_signature = generator.valueToCode(block, 'time_signature', generator.ORDER_ATOMIC);
                time_signature = time_signature.slice(1,-1).split('/').map(x=>parseInt(x));
                return [`midiEvent.time_signature(${At},${time_signature})`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_event_tempo",
            "message0": "%{BKY_MIDI_EVENT_TEMPO}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "At",
                    "check": "Number",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "bpm",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "output": "MidiEvent",
            "style": "midi_blocks",
            "tooltip": "改变速度事件\n起始时刻：单位tick，为-1则自动使用最后的时间，如果为其余负数则表示在最后的时间上延迟",
            "JavaScript": function (block, generator) {
                let At = generator.valueToCode(block, 'At', generator.ORDER_ATOMIC);
                let bpm = generator.valueToCode(block, 'bpm', generator.ORDER_ATOMIC);
                return [`midiEvent.tempo(${At},${bpm})`, generator.ORDER_NONE];
            }
        },
        //== over ==//
        {
            "type": "midi_export",
            "message0": "%{BKY_MIDI_EXPORT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Midi",
                    "check": "Midi",
                    "align": "RIGHT"
                }
            ],
            "output": "Array",
            "style": "midi_blocks",
            "tooltip": "导出midi文件数据",
            "JavaScript": function (block, generator) {
                let midi = generator.valueToCode(block, 'Midi', generator.ORDER_ATOMIC);
                return [`${midi}.export()`, generator.ORDER_NONE];
            }
        },
        {
            "type": "midi_download",
            "message0": "%{BKY_MIDI_DOWNLOAD}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Data",
                    "check": "Array",
                    "align": "RIGHT"
                },
                {
                    "type": "input_value",
                    "name": "FileName",
                    "check": "String",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "midi_blocks",
            "tooltip": "将midi文件数据转为文件并下载",
            "JavaScript": function (block, generator) {
                let downloadMidiFile = generator.provideFunction_(     // 在blockly中定义一个函数
                    'downloadMidiFile', [
                    'const ' + generator.FUNCTION_NAME_PLACEHOLDER_ + ' = (name, data) => {',
                    '  let midfile = new Blob([new Uint8Array(data)], { type: "application/octet-stream" });',
                    '  let link = document.createElement("a");',
                    '  link.href = window.URL.createObjectURL(midfile);',
                    '  link.download = name + ".mid";',
                    '  link.click();',
                    '};'
                ]);
                let data = generator.valueToCode(block, 'Data', generator.ORDER_ATOMIC);
                let FileName = generator.valueToCode(block, 'FileName', generator.ORDER_ATOMIC);
                return `${downloadMidiFile}(${FileName}, ${data});\n`;
            }
        },
        {
            "type": "midi_toJSON",
            "message0": "%{BKY_MIDI_TOJSON}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "Midi",
                    "check": ["Midi", "Mtrk"],
                    "align": "RIGHT"
                }
            ],
            "output": "String",
            "style": "midi_blocks",
            "tooltip": "整理midi或音轨的数据为易于理解的字典对象",
            "JavaScript": function (block, generator) {
                let midi = generator.valueToCode(block, 'Midi', generator.ORDER_ATOMIC);
                return [`${midi}.toJSON(0)`, generator.ORDER_NONE];
            }
        },
    ];
    // 消息定义
    Blockly.Msg["CATMIDI"] = "MIDI";
    Blockly.Msg["MIDI_NOTE"] = "音高%1音符%2";
    Blockly.Msg["MIDI_FILE_OPEN"] = "读取midi文件数据";
    Blockly.Msg["MIDI_READ"] = "解析midi数据%1";
    Blockly.Msg["MIDI_NEW"] = "新建midi %1速度%2拍号%3四分音符tick数%4音轨列表%5";
    Blockly.Msg["MIDI_ATTRIBUTE"] = "midi%1的%2";
    Blockly.Msg["MIDI_ADDTRACK"] = "为midi%1添加音轨%2";
    Blockly.Msg["MIDI_NEWTRACK"] = "新建音轨 轨名%1事件列表%2";
    Blockly.Msg["MIDI_ADDEVENT"] = "给音轨%1添加事件%2";
    Blockly.Msg["MIDI_EVENT_NOTE"] = "音符事件 时刻%1时长%2音高%3强度%4";
    Blockly.Msg["MIDI_EVENT_INSTRUMENT"] = "更改乐器事件 时刻%1乐器%2";
    Blockly.Msg["MIDI_EVENT_TIME_SIGNATURE"] = "更改拍号事件 时刻%1拍号%2";
    Blockly.Msg["MIDI_EVENT_TEMPO"] = "更改速度事件 时刻%1bpm速度%2";
    Blockly.Msg["MIDI_EXPORT"] = "导出midi%1为文件数据";
    Blockly.Msg["MIDI_DOWNLOAD"] = "将midi数据%1下载为文件%2";
    Blockly.Msg["MIDI_TOJSON"] = "整理%1为字典";

    Blockly.defineBlocksWithJsonArray(midiBlocks);
    // 代码生成器
    for (const block of midiBlocks) {
        Blockly.JavaScript.forBlock[block['type']] = block['JavaScript'];
    }

    // 保留词添加 放弃了lexicalVariable的前缀变量系统，用Blockly.JavaScript.nameDB_.getName，因此保留词很重要
    Blockly.JavaScript.addReservedWords('midi,mtrk,midiEvent'); // 相当于Blockly.JavaScript.RESERVED_WORDS_+='midi,mtrk,midiEvent,';

    // 插入toolbox
    if (toolbox.contents.length == 10) {     // 加一条分界线，以区分基本库和扩展库
        toolbox.contents.push({
            "kind": "sep"
        });
    }
    toolbox.contents.push({
        "kind": "category",
        "name": "%{BKY_CATMIDI}",
        "categorystyle": "midi_category",
        "contents": [
            {
                "kind": "block",
                "type": "midi_note",
                "fields": {
                    "Pitch": "4",
                    "Note": "0"
                }
            },
            {
                "kind": "block",
                "type": "midi_file_open"
            },
            {
                "kind": "block",
                "type": "midi_read"
            },
            {
                "kind": "block",
                "type": "midi_new",
                "inputs": {
                    "Name": {
                        "shadow": {
                            "type": "text",
                            "fields": {
                                "TEXT": "newMIDI"
                            }
                        }
                    },
                    "bpm": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "120"
                            }
                        }
                    },                    
                    "time_signature": {
                        "shadow": {
                            "type": "text",
                            "fields": {
                                "TEXT": "4/4"
                            }
                        }
                    },
                    "tick": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "480"
                            }
                        }
                    },
                    "Mtrk": {
                        "block": {
                            "type": "lists_create_with",
                            "extraState": {
                                "itemCount": 0
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_attribute"
            },
            {
                "kind": "block",
                "type": "midi_addtrack"
            },
            {
                "kind": "block",
                "type": "midi_newtrack",
                "inputs": {
                    "Name": {
                        "shadow": {
                            "type": "text",
                            "fields": {
                                "TEXT": "newTrack"
                            }
                        }
                    },
                    "Events": {
                        "block": {
                            "type": "lists_create_with",
                            "extraState": {
                                "itemCount": 0
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_addevent"
            },
            {
                "kind": "block",
                "type": "midi_event_note",
                "inputs": {
                    "At": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "-1"
                            }
                        }
                    },
                    "Duration": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "480"
                            }
                        }
                    },
                    "Note": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "60"
                            }
                        }
                    },
                    "Intensity": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "100"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_event_instrument",
                "inputs": {
                    "At": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "-1"
                            }
                        }
                    },
                    "Instrument": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "0"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_event_time_signature",
                "inputs": {
                    "At": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "-1"
                            }
                        }
                    },
                    "time_signature": {
                        "shadow": {
                            "type": "text",
                            "fields": {
                                "TEXT": "4/4"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_event_tempo",
                "inputs": {
                    "At": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "-1"
                            }
                        }
                    },
                    "bpm": {
                        "shadow": {
                            "type": "math_number",
                            "fields": {
                                "NUM": "120"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_export"
            },
            {
                "kind": "block",
                "type": "midi_download",
                "inputs": {
                    "FileName": {
                        "shadow": {
                            "type": "text",
                            "fields": {
                                "TEXT": "newMidi"
                            }
                        }
                    }
                }
            },
            {
                "kind": "block",
                "type": "midi_toJSON"
            }
        ],
        "categorystyle": "midi_category"
    });
    // 主题配置
    Blockly.Themes.Custom.blockStyles['midi_blocks'] = {
        'colourPrimary': "#66CCCC",
        'colourSecondary': "#a0a0a0",
        'colourTertiary': "#66FFFF"
    };
    Blockly.Themes.Custom.categoryStyles['midi_category'] = {
        'colour': "#66CCCC"
    };
})();