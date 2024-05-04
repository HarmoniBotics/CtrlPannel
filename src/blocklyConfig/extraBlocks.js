// 自定义块
/* 模板 最后一项"JavaScript"是我加的
{
    "type": "string_length",                    // 标识符
    "message0": 'length of %1 test %2',         // UI可见的提示，会根据args的顺序决定输入
    "args0": [
        {
            "type": "input_value",              // intput_value是块输入。可以用其他类，比如不是块
            "name": "VALUE",                    // name相同不会报错，但是代码只能获取第一个此名的块
            "check": "String"
        },
        {
            "type": "field_dropdown",
            "name": "VALUE",
            "options": [
                ["C4", "sounds/c4.m4a"],
                ["D4", "sounds/d4.m4a"],
                ["E4", "sounds/e4.m4a"],
                ["F4", "sounds/f4.m4a"],
                ["G4", "sounds/g4.m4a"]
            ]
        }
    ],
    // 可以取message1和arg1，但是必须从0开始递增，即不能只有1而没有0。argsi的意义在于换行显示(比如循环语句，如果不用args1则提示语"do"会出现在上一行而不是内容的左边)
    "output": "Number",                         // 此行与下两行互斥 写了就有，值为类型 null表示所有类型
    "previousStatement": null,
    "nextStatement": null,
    "style": "control_blocks",                  // 和下面的互斥 用此方法可以用theme批量设置
    "colour": 160,
    "inputsInline": true,                       // 一行显示 无定义会自动判断
    "tooltip": function(div, block){return String();},    // 或者直接字符串 用函数可以自定义提示样式
    "helpUrl": "https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks?hl=zh-cn#context_menus",
    "JavaScript": function(block, generator) {          // 对于js，可以用Blockly.JavaScript也可以用generator
        var FieldValue = block.getFieldValue('X');      // 用于输入不是块的，见：https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/overview
        var dropdown = block.getFieldValue('END') == 'FIRST' ? 'indexOf' : 'lastIndexOf';   // 下拉菜单的返回值是FIRST之类的通用语言 如果像上面C4那样有两项则返回列表第二项
        var variable = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);     // 对于变量下拉列表，为了防止变量名用了关键词，用此方法消除
        var listVar = generator.nameDB_.getDistinctName('可能非法的变量名', Blockly.Names.NameType.VARIABLE);      // 可能需要增加过程变量。防止变量名冲突用此方法
        var code = 'var ' + listVar + ' = ' + arg0 + ';\n';
        var InputValue = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ATOMIC) || '0';   // 得到相连的块的值。优先级就这样配置，取值用最高优先级，返回用最低优先级 https://blockly.tortorse.com/guides/create-custom-blocks/operator-precedence.html
        return [`${FieldValue}+${InputValue}`, Blockly.JavaScript.ORDER_NONE];      // 为了考虑级联，(must)返回列表，第一项是代码文本，第二项是运算优先级（括号）
        // 如果是语句，因为没有运算优先级，直接返回字符串即可
    }
}*/
// 有些功能只能用js声明，比如setDeletable等

// 注册变形器
// 点开一个Mutator的执行顺序：decompose saveconnectons compose saveconnectons compose
// 连接/断开的执行顺序： compose saveConnections
// 主块指工具箱里那个，而顶层块指主块弹出窗里的大块。子块为弹窗里置于顶层块内的小块
; (function () {
    var MutatorTemplate = {
        // JSON初始化方法
        saveExtraState: function () {
            return {
                'itemCount': this.itemCount_
            };
        },
        loadExtraState: function (state) {
            this.itemCount_ = state['itemCount'];
            this.updateShape_();
        },
        // 当创建自定义块时，首先调用decompose方法来创建和连接子块。
        decompose: function (workspace) {
            // This is a special sub-block that only gets created in the mutator UI.
            // It acts as our "top block" 顶层块(连到谁上面)
            const topBlock = workspace.newBlock('lists_create_with_container');
            topBlock.initSvg();
            // Then we add one sub-block for each item in the list.
            var connection = topBlock.getInput('STACK').connection;
            for (var i = 0; i < this.itemCount_; i++) {
                const itemBlock = workspace.newBlock('lists_create_with_item');
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }
            return topBlock;
        },
        // 当mutator UI中重新组合自定义块时，首先调用compose方法来断开不再存在的子块的连接，并重新连接现有的子块
        compose: function (topBlock) {  // 输入是顶层块，即弹出窗的那个
            var itemBlock = topBlock.getInputTargetBlock('STACK');    // 得到stack中的第一个块
            // 得到连接到每个输入的块
            var connections = [];
            while (itemBlock && !itemBlock.isInsertionMarker()) {   // Ignore insertion markers!
                connections.push(itemBlock.valueConnection_);       // valueConnection_在saveConnections中设置，为本体连接的块(横向)，如果没连就是null
                itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
            }
            for (var i = 0; i < this.itemCount_; i++) {
                // this.getInput得到主块的输入(json定义里args里的)
                // 个人认为，connection属性相当于“有向图图”里的“箭头”，其targetConnection指向另一端的端口(是connection类型)（sourceBlock_似乎是这一端的块，block类型）
                var connection = this.getInput('ADD' + i).connection.targetConnection;
                // 如果主块连接了，但不在表中就断开，即主块比顶层块多的输入，即本次操作移除的块
                if (connection && connections.indexOf(connection) == -1) connection.disconnect();
            }
            // `this` refers to the main block. 以顶层块所连数目为准，更新主块的UI
            this.itemCount_ = connections.length;
            this.updateShape_();
            // And finally we reconnect any child blocks.   官方的代码有问题！connections[i]可能是null(即输入没有连接任何块)，所以加了判断
            for (var i = 0; i < this.itemCount_; i++) {
                // Reconnects this connection to the input with the given name on the given block.
                // 这个函数是新加的，在2021最后一版（没删编译好的文件）的方法(Mutator.reconnect(connections[i], this, 'ADD' + i))已经没了
                if (connections[i]) connections[i].reconnect(this, 'ADD' + i);   // 在此给输入命名
            }
        },
        saveConnections: function (topBlock) {
            var itemBlock = topBlock.getInputTargetBlock('STACK');
            var i = 0;
            while (itemBlock) {
                // `this` refers to the main block (which is being "mutated").
                var input = this.getInput('ADD' + i);
                // This is the important line of this function!
                // 在顶层块的子块存了主块的输入
                itemBlock.valueConnection_ = input && input.connection.targetConnection;    // js中&&和C++的不一样
                i++;
                itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
            }
        },
        updateShape_: function () {
            for (let i = 0; i < this.itemCount_; i++) {
                if (!this.getInput('ADD' + i)) {
                    this.appendValueInput('ADD' + i);
                }
            }
            // Remove deleted inputs.
            for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
                this.removeInput('ADD' + i);
            }
        }
    }
    Blockly.Extensions.registerMutator(
        'Arrayitems_mutator', MutatorTemplate, undefined,
        ['lists_create_with_item']  // 备选的小块
    );

    Blockly.Extensions.registerMutator(
        'DictItems_mutator', {
        saveExtraState: MutatorTemplate.saveExtraState,
        loadExtraState: MutatorTemplate.loadExtraState,
        decompose: function (workspace) {
            const topBlock = workspace.newBlock('dictionarise_create_with_container');
            topBlock.initSvg();
            var connection = topBlock.getInput('STACK').connection;
            for (var i = 0; i < this.itemCount_; i++) {
                const itemBlock = workspace.newBlock('dictionaries_mutator_pair');
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }
            return topBlock;
        },
        compose: MutatorTemplate.compose,
        saveConnections: MutatorTemplate.saveConnections,
        updateShape_: MutatorTemplate.updateShape_
    }, undefined, ['dictionaries_mutator_pair']
    );



    Blockly.Extensions.registerMutator(
        'RenameVar_mutator', {
        saveExtraState: MutatorTemplate.saveExtraState,
        loadExtraState: function (state) {
            this.itemCount_ = state['itemCount'];
            if (this.lexicalVariableDefined_ == undefined) {      // 是否启用lexicalVariable变量系统
                this.lexicalVariableDefined_ = !Blockly.getMainWorkspace().getToolbox().toolboxDef_.contents.find((x) => x.custom == "VARIABLE") // 无"custom": "VARIABLE"
                    && Boolean(window.LexicalVariables);
                if (this.lexicalVariableDefined_) {             // 在只执行一次的地方定义onchange事件
                    this.setOnChange(function (changeEvent) {   // 从lexicaVariable插件的lexical-variables.js中学的，setOnChange在原型链中
                        window.LexicalVariables.WarningHandler.checkErrors(this);
                    });
                }
            }
            this.updateShape_();
        },
        decompose: function (workspace) {
            const topBlock = workspace.newBlock('text_create_join_container');
            topBlock.initSvg();
            var connection = topBlock.getInput('STACK').connection;
            for (var i = 0; i < this.itemCount_; i++) {
                const itemBlock = workspace.newBlock('text_create_join_item');
                itemBlock.initSvg();
                connection.connect(itemBlock.previousConnection);
                connection = itemBlock.nextConnection;
            }
            return topBlock;
        },
        compose: MutatorTemplate.compose,
        saveConnections: MutatorTemplate.saveConnections,
        updateShape_: function () {
            if (this.lexicalVariableDefined_) {   // 有LexicalVariables插件的创建
                for (let i = 0; i < this.itemCount_; i++) {
                    if (!this.getInput('ADD' + i)) {
                        let fieldLexicalVariable = new window.LexicalVariables.FieldLexicalVariable(' ');
                        fieldLexicalVariable.setBlock(this);    // 调用此函数后才能获取局部变量
                        this.appendValueInput('ADD' + i).setCheck("String").setAlign(Blockly.ALIGN_RIGHT)
                            .appendField("重命名变量")
                            .appendField(fieldLexicalVariable, 'VAR' + i)
                            .appendField("为");
                        this.moveInputBefore('ADD' + i, "js");
                    }
                }
                if (this.itemCount_) {      // 仿lexicaVariable插件的lexical-variables.js写法。checkErrors会遍历error属性存的错误
                    this.errors = [{
                        func: window.LexicalVariables.WarningHandler.checkDropDownContainsValidValue,
                        dropDowns: Array.from({ length: this.itemCount_ }, (_, i) => `VAR${i}`),
                    }];
                }
            } else {    // 无LexicalVariables插件的创建
                if (!Blockly.getMainWorkspace().getAllVariables().length) this.setWarningText("no available variables");
                for (let i = 0; i < this.itemCount_; i++) {
                    if (!this.getInput('ADD' + i)) {
                        // input代表了连接，而block指整个块，包含前者
                        this.appendValueInput('ADD' + i).setCheck("String").setAlign(Blockly.ALIGN_RIGHT)
                            .appendField("重命名变量")
                            .appendField(new Blockly.FieldDropdown(function () {
                                let ops = Blockly.getMainWorkspace().getAllVariables();
                                return ops.length ? Array.from(ops, x => [x.name, x.name]) : [["", ""]];
                            }), 'VAR' + i)
                            .appendField("为");
                        this.moveInputBefore('ADD' + i, "js");
                    }
                }
            }
            // Remove deleted inputs.
            for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
                this.removeInput('ADD' + i);
            }
        }
    }, undefined,
        ['text_create_join_item']  // 备选的小块
    );
})();

// 初始化自定义块 记得在toolbox中加入位置
(function () {
    const extraBlocks = [
        {
            "type": "controls_print",
            "message0": "%{BKY_CONTROLS_PRINT}%1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "msg"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks",
            "tooltip": "console.log(x)",
            "JavaScript": function (block, generator) {
                let msg = generator.valueToCode(block, 'msg', generator.ORDER_ATOMIC);
                return `console.log(${msg});\n`;
            }
        }, {
            "type": "controls_eval",
            "message0": "%{BKY_CONTROLS_RUNJS}%1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "js",
                    "align": "RIGHT"
                }
            ],
            'mutator': "RenameVar_mutator",
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks",
            "tooltip": "eval(x)",
            "JavaScript": function (block, generator) {
                let renames = '';
                if (block.mutator.sourceBlock.lexicalVariableDefined_) {     // 用console.log(block)找到的属性
                    for (let i = 0; i < block.inputList.length - 1; i++)
                        renames += `let ${generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC).slice(1, -1)} = ${window.LexicalVariables.getVariableName(block.getFieldValue(`VAR${i}`))}\n`;
                } else {
                    for (let i = 0; i < block.inputList.length - 1; i++)
                        renames += `let ${generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC).slice(1, -1)} = ${generator.nameDB_.getName(block.getFieldValue(`VAR${i}`), Blockly.VARIABLE_CATEGORY_NAME)}\n`;
                }
                let js = generator.valueToCode(block, 'js', generator.ORDER_ATOMIC);
                return `{\n${renames}${eval(js)}\n}\n`;     // 变量js长这样："'line1' + '\n' + 'line2' + ..." 所以用eval合并字符串
            }
        },
        {
            "type": "controls_typeof",
            "message0": "%{BKY_CONTROLS_TYPEOF}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "obj"
                }
            ],
            "output": null,
            "style": "control_blocks",
            "tooltip": "return 'number' or 'object' or 'string'",
            "JavaScript": function (block, generator) {
                let obj = generator.valueToCode(block, 'obj', generator.ORDER_ATOMIC);
                return [`typeof ${obj}`, generator.ORDER_NONE];
            }
        },
        {
            "type": "controls_ignore_return",
            "message0": "%{BKY_CONTROLS_IGNORE_RETURN}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "run"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks",
            "tooltip": "run but ignore the return. Useful when turning a return block to a statement",
            "JavaScript": function (block, generator) {
                let codes = generator.valueToCode(block, 'run', generator.ORDER_ATOMIC);
                if (codes[0] == '(') codes = codes.slice(1, -1);   // 去掉括号
                return codes + ';\n';
            }
        }, {
            "type": "controls_delay",
            "message0": "%{BKY_CONTROLS_DELAY}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "time",
                    "check": "Number"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks",
            "tooltip": "延时",
            "JavaScript": function (block, generator) {
                let delayFunction = generator.provideFunction_(
                    'delay',
                    [ 'const ' + generator.FUNCTION_NAME_PLACEHOLDER_ + ' = (delay) => ',
                      '  new Promise((resolve) => setTimeout(resolve, delay));'
                    ]);
                let time = generator.valueToCode(block, 'time', generator.ORDER_ATOMIC);
                return `await ${delayFunction}(${time});\n`;
            }
        }, {
            "type": "controls_timeout",
            "message0": "%{BKY_CONTROLS_TIMEOUT}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "time",
                    "check": "Number"
                }
            ],
            "message1": "%{BKY_CONTROLS_ASYNC_DO}",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "output": "Number",
            "style": "control_blocks",
            "tooltip": "异步延迟,不阻塞\n返回时钟id,用于清除",
            "JavaScript": function (block, generator) {
                let time = generator.valueToCode(block, 'time', generator.ORDER_ATOMIC);
                let DO = generator.statementToCode(block, 'DO');
                return [`setTimeout(()=>{\n${DO}},${time})`, generator.ORDER_NONE];
            }
        }, {
            "type": "controls_interval",
            "message0": "%{BKY_CONTROLS_INTERVAL}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "time",
                    "check": "Number"
                }
            ],
            "message1": "%{BKY_CONTROLS_ASYNC_DO}",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "output": "Number",
            "style": "control_blocks",
            "tooltip": "异步延迟,不阻塞\n返回时钟ID,用于清除",
            "JavaScript": function (block, generator) {
                let time = generator.valueToCode(block, 'time', generator.ORDER_ATOMIC);
                let DO = generator.statementToCode(block, 'DO');
                return [`setInterval(()=>{\n${DO}},${time})`, generator.ORDER_NONE];
            }
        }, {
            "type": "controls_clear_clock",
            "message0": "%{BKY_CONTROLS_CLEAR_CLK}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "CLK",
                    "check": "Number"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "control_blocks",
            "tooltip": "取消计时。传参为时钟ID",
            "JavaScript": function (block, generator) {
                let clk = generator.valueToCode(block, 'CLK', generator.ORDER_ATOMIC);
                return `clearInterval(${clk});\n`;   // 由于clearTimeout和clearInterval共享ID池，所以可以混用
            }
        }, {
            "type": "lists_isArray",
            "message0": "%{BKY_LISTS_ISARRAY}%1",
            "args0": [
                {
                    "type": "input_value",
                    "name": "obj"
                }
            ],
            "output": null,
            "style": "list_blocks",
            "tooltip": "Array.isArray(x)",
            "JavaScript": function (block, generator) {
                let obj = generator.valueToCode(block, 'obj', generator.ORDER_ATOMIC);
                return [`Array.isArray(${obj})`, generator.ORDER_NONE];
            }
        }, {
            "type": "lists_push",
            "message0": "%{BKY_LISTS_PUSH}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "list"
                }
            ],
            'mutator': 'Arrayitems_mutator',
            "output": "Array",
            "style": "list_blocks",
            "tooltip": "Array.push()",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let l = generator.valueToCode(block, 'list', generator.ORDER_ATOMIC);
                let pushes = Array.from({ length: block.inputList.length - 2 }, (_, i) =>
                    generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC)
                )
                // 说是push，但要返回Array，就用这个方法代替吧
                return [`[...${l},${pushes.join(',')}]`, generator.ORDER_NONE];
            }
        }, {
            "type": "lists_splice",
            "message0": "%{BKY_LISTS_SPLICE}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "list",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "at",
                    "align": "RIGHT",
                    "check": "Number"
                }, {
                    "type": "input_value",
                    "name": "deleteNum",
                    "check": "Number",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            'mutator': 'Arrayitems_mutator',
            "style": "list_blocks",
            "tooltip": "Array.splice(); 如果删除0则表示不删除，没有添加项则不添加",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let l = generator.valueToCode(block, 'list', generator.ORDER_ATOMIC);
                let at = generator.valueToCode(block, 'at', generator.ORDER_ATOMIC);
                let deleteNum = generator.valueToCode(block, 'deleteNum', generator.ORDER_ATOMIC);
                let adds = Array.from({ length: block.inputList.length - 4 }, (_, i) =>
                    generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC)
                )
                return `${l}.splice(${at}-1,${deleteNum},${adds.join(',')});\n`;  // blockly的逻辑是从1开始
            }
        }, {
            "type": "lists_sort_diy",
            "message0": "%{BKY_LISTS_SORT_DIY}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "list",
                    "check": "Array",
                    "align": "RIGHT"
                }, {
                    "type": "input_value",
                    "name": "rule",
                    "align": "RIGHT"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "style": "list_blocks",
            "helpUrl": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
            "tooltip": "Array.sort() 自定义排序规则\n请保证其有两个传入参数，输出为一个数字",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let l = generator.valueToCode(block, 'list', generator.ORDER_ATOMIC);
                let r = generator.valueToCode(block, 'rule', generator.ORDER_ATOMIC);
                return `${l}.sort(${r});\n`;
            }
        }, {
            "type": "lists_concat",
            "message0": "%{BKY_LISTS_CONCAT}",
            'mutator': 'Arrayitems_mutator',
            "output": "Array",
            "style": "list_blocks",
            "tooltip": "Array.concat() 合并列表",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let lists = Array.from({ length: block.inputList.length - 1 }, (_, i) =>
                    generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC)
                )
                // 说是push，但要返回Array，就用这个方法代替吧
                return [`[...${lists.join(', ...')}]`, generator.ORDER_NONE];
            }
        }, {
            "type": "dictionaries_concat",
            "message0": "%{BKY_DICTIONARIES_CONCAT}",
            'mutator': 'DictItems_mutator',
            "output": "Dictionary",
            "style": "dictionary_blocks",
            "tooltip": "返回合并后的字典，不改变输入",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let dicts = Array.from({ length: block.inputList.length - 1 }, (_, i) =>
                    generator.valueToCode(block, `ADD${i}`, generator.ORDER_ATOMIC)
                )
                return [`{...${dicts.join(', ...')}}`, generator.ORDER_NONE];
            }
        }, {
            "type": "procedure_get",
            "message0": "%{BKY_PROCEDURE_GET}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "NAME",
                    "check": "String"
                }
            ],
            "output": "Procedure",
            "style": "procedure_blocks",
            "tooltip": "按名字获取函数",
            "inputsInline": true,
            "JavaScript": function (block, generator) {
                let NAME = generator.valueToCode(block, "NAME", generator.ORDER_ATOMIC);    // 注意返回的字符串前后有引号，要删去
                const funcName = generator.nameDB_.getName(NAME.slice(1, -1), Blockly.PROCEDURE_CATEGORY_NAME);
                return [funcName, generator.ORDER_NONE];
            }
        }, {
            "type": "procedure_call_by_name",
            "message0": "%{BKY_PROCEDURE_CALL_BY_NAME}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "NAME",
                    "check": ["String", "Procedure"]
                },
                {
                    "type": "input_value",
                    "name": "PARAMS",
                    "check": "Array"
                }
            ],
            "output": null,
            "style": "procedure_blocks",
            "tooltip": "调用函数",
            "inputsInline": false,
            "JavaScript": function (block, generator) {
                let NAME = generator.valueToCode(block, "NAME", generator.ORDER_ATOMIC);
                let check = block.inputList[0].connection.targetConnection.check;
                if (check && check[0] == 'String')
                    NAME = generator.nameDB_.getName(NAME.slice(1, -1), Blockly.PROCEDURE_CATEGORY_NAME);
                let PARAMS = generator.valueToCode(block, "PARAMS", generator.ORDER_ATOMIC);
                if (PARAMS) {
                    PARAMS = PARAMS.slice(1, -1).split(',').map(x => x.trim());
                    return [`${NAME}(${PARAMS.join(",")})`, generator.ORDER_NONE];
                } else {    // 如果没有输入
                    return [`${NAME}()`, generator.ORDER_NONE];
                }
            }
        },
    ]
    // 可以用json注册，也可以用js注册，用其一即可。
    Blockly.defineBlocksWithJsonArray(extraBlocks);
    // 代码生成器
    for (const block of extraBlocks) {
        Blockly.JavaScript.forBlock[block['type']] = block['JavaScript'];
    }
})();

