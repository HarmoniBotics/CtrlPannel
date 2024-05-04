// 修订完成！
Blockly.Blocks['dictionaries_create_with'] = {
    init: function () {
        this.setStyle('dictionary_blocks');
        // this.setColour(Blockly.DICTIONARIES_HUE);
        this.appendValueInput('ADD0')
            .appendField(Blockly.Msg['DICTIONARIES_CREATE_WITH_INPUT_WITH'])
            .setCheck('pair');
        this.appendValueInput('ADD1')
            .setCheck('pair');
        this.setOutput(true, 'Dictionary');
        this.setMutator(new Blockly.icons.MutatorIcon(['dictionaries_mutator_pair'], this));
        this.setTooltip(Blockly.Msg.LANG_DICTIONARIES_MAKE_DICTIONARY_TOOLTIP);
        this.itemCount_ = 2;
    },
    mutationToDom: Blockly.Blocks.lists_create_with.mutationToDom,
    domToMutation: Blockly.Blocks.lists_create_with.domToMutation,
    saveExtraState: Blockly.Blocks.lists_create_with.saveExtraState,
    loadExtraState: Blockly.Blocks.lists_create_with.loadExtraState,
    decompose: function (workspace) {
        const containerBlock = workspace.newBlock('dictionarise_create_with_container');
        containerBlock.initSvg();
        let connection = containerBlock.getInput('STACK').connection;
        for (let i = 0; i < this.itemCount_; i++) {
            const itemBlock = workspace.newBlock('dictionaries_mutator_pair');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (topBlock) {  // 抄的extraBlocks.js中的内容，去掉了注释
        var itemBlock = topBlock.getInputTargetBlock('STACK');
        var connections = [];
        while (itemBlock && !itemBlock.isInsertionMarker()) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) connection.disconnect();
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        for (var i = 0; i < this.itemCount_; i++) {
            if (connections[i]) connections[i].reconnect(this, 'ADD' + i);
        }
    },
    saveConnections: Blockly.Blocks.lists_create_with.saveConnections,
    updateShape_: function () {
        if (this.itemCount_ && this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
            this.appendDummyInput('EMPTY').appendField(
                Blockly.Msg['DICTIONARIES_CREATE_EMPTY_TITLE']);
        }
        // Add new inputs.
        for (let i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                const input = this.appendValueInput('ADD' + i).setAlign(Blockly.inputs.Align.RIGHT);
                if (i === 0) {
                    input.appendField(Blockly.Msg['DICTIONARIES_CREATE_WITH_INPUT_WITH']);
                }
            }
        }
        // Remove deleted inputs.
        for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
            this.removeInput('ADD' + i);
        }
    },
    /**
     * Create a human-readable text representation of this block and any children.
     * @param {number=} opt_maxLength Truncate the string to this length.
     * @param {string=} opt_emptyToken The placeholder string used to denote an
     *     empty field. If not specified, '?' is used.
     * @return {string} Text of block.
     */
    toString: function (opt_maxLength, opt_emptyToken) {
        var buffer = '{';
        var checkLen = true;
        opt_emptyToken = opt_emptyToken || '?';
        if (!opt_maxLength || opt_maxLength === 0) {
            checkLen = false;
        }
        var sep = '';
        for (var i = 0, input; (input = this.getInput('ADD' + i)) && (!checkLen || buffer.length < opt_maxLength); i++) {
            var target = input.connection.targetBlock();
            if (target) {
                var keyblock = target.getInput('KEY').connection.targetBlock();
                var valueblock = target.getInput('VALUE').connection.targetBlock();
                if (keyblock || valueblock) {
                    buffer += sep;
                    buffer += keyblock ? keyblock.toString(opt_maxLength, opt_emptyToken) : opt_emptyToken;
                    buffer += ':';
                    buffer += valueblock ? valueblock.toString(opt_maxLength, opt_emptyToken) : opt_emptyToken;
                    sep = ',';
                }
            }
        }
        if (checkLen && buffer.length >= opt_maxLength) {
            buffer = buffer.substring(0, opt_maxLength - 2);
            buffer += '…'
        }
        buffer += '}';
        return buffer;
    }
};

Blockly.Blocks['dictionaries_mutator_pair'] = {
    init: function () {
        this.setStyle('dictionary_blocks');
        // this.setColour(Blockly.DICTIONARY_CATEGORY_HUE); // 被上面一行取代
        this.appendDummyInput().appendField(Blockly.Msg['DICTIONARIES_PAIR_TITLE']);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip(Blockly.Msg['DICTIONARIES_PAIR_TOOLTIP']);
        this.contextMenu = false;
    }
};

Blockly.Blocks['dictionarise_create_with_container'] = {
    init: function () {
        this.setStyle('dictionary_blocks');
        this.appendDummyInput().appendField(Blockly.Msg['DICTIONARIES_CREATE_WITH_CONTAINER_TITLE_ADD']);
        this.appendStatementInput('STACK');
        this.setTooltip(Blockly.Msg['DICTIONARIES_CREATE_WITH_CONTAINER_TOOLTIP']);
        this.contextMenu = false;
    }
};

Blockly.JavaScript.forBlock['dictionaries_create_with'] = function (block, generator) {
    let keys = [];
    if (this.itemCount_ == 0) return ['{}', generator.ORDER_NONE];
    for (let i = 0; i < this.itemCount_; i++) {
        let k = generator.valueToCode(block, 'ADD' + i, generator.ORDER_NONE);
        keys.push(k);
    }
    return [`{\n  ${keys.join(',\n  ')}\n}`, generator.ORDER_NONE];
};

// 因为要动态提示所以不用JSON定义
Blockly.Blocks['dictionaries_getters'] = {
    init: function () {
        this.jsonInit({
            "type": "dictionaries_getters",
            "message0": "%{BKY_DICTIONARIES_GETTER}",
            "args0": [
                {
                    "type": "field_dropdown",
                    "name": "OP",
                    "options": [
                        ["keys", "keys"],
                        ["values", "values"]
                    ]
                }, {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }
            ],
            "output": "Array",
            "style": "dictionary_blocks"
        });
        var thisBlock = this;
        this.setTooltip(function () {
            return thisBlock.getFieldValue('OP') == "keys" ? "字典所有键的列表" : "字典所有值的列表";
        });
    }
};
Blockly.JavaScript.forBlock['dictionaries_getters'] = function (block, generator) {
    let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
    let op = block.getFieldValue('OP');
    return [`Object.${op}(${dict})`, generator.ORDER_NONE];
};

(function () {
    const elseBlocks = [
        {
            "type": "dictionaries_pair",
            "message0": "%{BKY_DICTIONARIES_PAIR}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "KEY",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "VALUE",
                    "align": "RIGHT"
                }
            ],
            "output": "pair",
            "style": "dictionary_blocks",
            "tooltip": "key and value, 'key': value",
            "inputsInline": true,
            "JavaScript": function (block, generator) {
                let key = generator.valueToCode(block, 'KEY', generator.ORDER_ATOMIC);
                let value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC);
                return [`${key}: ${value}`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_lookup",
            "message0": "%{BKY_DICTIONARIES_LOOKUP}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "KEY",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "NOTFOUND",
                    "align": "RIGHT"
                }
            ],
            "output": null,
            "style": "dictionary_blocks",
            "tooltip": "在字典中获取key的值",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let key = generator.valueToCode(block, 'KEY', generator.ORDER_ATOMIC);
                let notfound = generator.valueToCode(block, 'NOTFOUND', generator.ORDER_ATOMIC) || undefined;
                return [`(${key} in ${dict})?${dict}[${key}]:${notfound}`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_set_pair",
            "message0": "%{BKY_DICTIONARIES_SET_PAIR}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "KEY",
                    "check": "String",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "VALUE",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "dictionary_blocks",
            "tooltip": "设置字典键值",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let key = generator.valueToCode(block, 'KEY', generator.ORDER_ATOMIC);
                let value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC);
                return `${dict}[${key}] = ${value};\n`;
            }
        }, {
            "type": "dictionaries_delete_pair",
            "message0": "%{BKY_DICTIONARIES_DELETE_PAIR}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "KEY",
                    "check": "String",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "dictionary_blocks",
            "tooltip": "删除字典键值",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let key = generator.valueToCode(block, 'KEY', generator.ORDER_ATOMIC);
                return `delete ${dict}[${key}];\n`;
            }
        }, {
            "type": "dictionaries_recursive_lookup",
            "message0": "%{BKY_DICTIONARIES_RECURSIVE_LOOKUP}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "PATH",
                    "check": ["String", "Array"],
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "NOTFOUND",
                    "align": "RIGHT"
                }
            ],
            "output": null,
            "style": "dictionary_blocks",
            "tooltip": "按路径取键对应的值，路径为键列表或用.分割的字符串",
            "JavaScript": function (block, generator) {
                let recursive_lookup = generator.provideFunction_(
                    'recursive_lookup', [
                    'const ' + generator.FUNCTION_NAME_PLACEHOLDER_ + ' = (dict, path, notfound = null) => {',
                    '  if (typeof path == "string") path = path.split(".");',
                    '  let result = dict;',
                    '  for(let i=0;i<path.length;i++){',
                    '    if(path[i] in result) result = result[path[i]];',
                    '    else return notfound;',
                    '  } return result;',
                    '};'
                ]); // 关于这个函数的设计，需要注意如果最后一级有这个键，但是值为undefined，不能返回notfound
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let path = generator.valueToCode(block, 'PATH', generator.ORDER_ATOMIC);
                let notfound = generator.valueToCode(block, 'NOTFOUND', generator.ORDER_ATOMIC) || undefined;
                return [`${recursive_lookup}(${dict}, ${path}, ${notfound})`, generator.ORDER_NONE]
            }
        }, {
            "type": "dictionaries_recursive_set",
            "message0": "%{BKY_DICTIONARIES_RECURSIVE_SET}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "PATH",
                    "check": ["String", "Array"],
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "VALUE",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "dictionary_blocks",
            "tooltip": "按路径设置键的值，路径为键列表或用.分割的字符串",
            "JavaScript": function (block, generator) {
                let recursive_set = generator.provideFunction_(
                    'recursive_set', [
                    'const ' + generator.FUNCTION_NAME_PLACEHOLDER_ + ' = (dict, path, value) => {',
                    '  if (typeof path == "string") path = path.split(".");',
                    '  if (path.length == 1) return dict[path[0]] = value;',
                    '  if (typeof dict[path[0]] != "object") dict[path[0]] = {};',
                    '  return recursive_set(dict[path[0]],path.slice(1),value);',
                    '};'
                ]);
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let path = generator.valueToCode(block, 'PATH', generator.ORDER_ATOMIC);
                let value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC);
                return `${recursive_set}(${dict}, ${path}, ${value});\n`;
            }
        }, {
            "type": "dictionaries_is_key_in",
            "message0": "%{BKY_DICTIONARIES_IS_KEY_IN}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "KEY",
                    "check": "String",
                    "align": "RIGHT"
                }
            ],
            "output": "Boolean",
            "style": "dictionary_blocks",
            "tooltip": "如果字典中有这个值则返回真",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                let key = generator.valueToCode(block, 'KEY', generator.ORDER_ATOMIC);
                // 注意hasOwnProperty和in的区别。这里用in比较好
                return [`${key} in ${dict}`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_alist_to_dict",
            "message0": "%{BKY_DICTIONARIES_ALIST_TO_DICT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "List",
                    "check": "Array",
                    "align": "RIGHT"
                }
            ],
            "output": "Dictionary",
            "style": "dictionary_blocks",
            "tooltip": "键值对列表转字典。键值对形式:[[key,value],...]",
            "JavaScript": function (block, generator) {
                let l = generator.valueToCode(block, 'List', generator.ORDER_ATOMIC);
                return [`Object.fromEntries(${l})`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_dict_to_alist",
            "message0": "%{BKY_DICTIONARIES_DICT_TO_ALIST}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }
            ],
            "output": "Array",
            "style": "dictionary_blocks",
            "tooltip": "字典转键值对列表",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                return [`Object.entries(${dict})`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_copy",
            "message0": "%{BKY_DICTIONARIES_COPY}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT",
                    "align": "RIGHT"
                }
            ],
            "output": null,
            "style": "dictionary_blocks",
            "tooltip": "深拷贝",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'DICT', generator.ORDER_ATOMIC);
                return [`JSON.parse(JSON.stringify(${dict}))`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_combine_dicts",
            "message0": "%{BKY_DICTIONARIES_COMBINE_DICTS}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "DICT1",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "DICT2",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "dictionary_blocks",
            "tooltip": "合并字典，会改变其中一个字典",
            "JavaScript": function (block, generator) {
                let dict1 = generator.valueToCode(block, 'DICT1', generator.ORDER_ATOMIC);
                let dict2 = generator.valueToCode(block, 'DICT2', generator.ORDER_ATOMIC);
                return `Object.assign(${dict1}, ${dict2});\n`;
            }
        }, {
            "type": "dictionaries_is_dict",
            "message0": "%{BKY_DICTIONARIES_IS_DICT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "OBJ",
                    "align": "RIGHT"
                }
            ],
            "output": "Boolean",
            "style": "dictionary_blocks",
            "tooltip": "判断是否为字典(对象)，通过判断其构造函数实现",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'OBJ', generator.ORDER_ATOMIC);
                return [`${dict}.constructor === Object`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_toJSON",
            "message0": "%{BKY_DICTIONARIES_TOJSON}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "OBJ",
                    "align": "RIGHT"
                }
            ],
            "output": "String",
            "style": "dictionary_blocks",
            "tooltip": "将字典(列表)转为JSON字符串",
            "JavaScript": function (block, generator) {
                let dict = generator.valueToCode(block, 'OBJ', generator.ORDER_ATOMIC);
                return [`JSON.stringify(${dict})`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_fromJSON",
            "message0": "%{BKY_DICTIONARIES_FROMJSON}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "JSON",
                    "check": "String",
                    "align": "RIGHT"
                }
            ],
            "output": null,
            "style": "dictionary_blocks",
            "tooltip": "将JSON字符串转为字典(列表)",
            "JavaScript": function (block, generator) {
                let json = generator.valueToCode(block, 'JSON', generator.ORDER_ATOMIC);
                return [`JSON.parse(${json})`, generator.ORDER_NONE];
            }
        }
    ];
    Blockly.defineBlocksWithJsonArray(elseBlocks);
    for (const block of elseBlocks) {
        Blockly.JavaScript.forBlock[block['type']] = block['JavaScript'];
    }
})();
// dictionaries_walk_tree和dictionaries_walk_all不实现