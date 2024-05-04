var _asyncSuppport = {       // 支持async/await：第一次生成得到所有函数名，第二次生成时将含await的函数的名字替换为async函数名
    defaultGenerator: Blockly.JavaScript.forBlock['procedures_callreturn'],
    awaitGenerator: function (block, generator) {
        const funcName = generator.nameDB_.getName(
            block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
        const args = [];
        const variables = block.arguments_;
        for (let i = 0; i < variables.length; i++) {
            args[i] = generator.valueToCode(block, 'ARG' + i,
                generator.ORDER_NONE) || 'null';
        }
        let code = funcName + '(' + args.join(', ') + ')';
        if (window._asyncSuppport.asyncFuns.has(funcName)) code = "await " + code; // 新增不行哦，因为先生成的
        return [code, generator.ORDER_FUNCTION_CALL];
    },
    defaultWorkspaceToCode: Blockly.JavaScript.workspaceToCode,
    asyncFuns: new Set(),  // 哪些函数需要异步化。由于两次生成，使用set去重
    asyncWorkspaceToCode: function (workspace) {   // this为asyncSupport
        this.asyncFuns.clear();
        let code = this.defaultWorkspaceToCode.call(Blockly.JavaScript, workspace);
        if (code.includes('await')) {
            // 需要第二次生成，因为转为代码块的顺序是空间顺序，因此函数声明不一定是第一个转代码的，导致调用函数时asyncFuns不一定有值
            Blockly.JavaScript.forBlock['procedures_callreturn'] = this.awaitGenerator;
            code = this.defaultWorkspaceToCode.call(Blockly.JavaScript, workspace);
            Blockly.JavaScript.forBlock['procedures_callreturn'] = this.defaultGenerator;  // 恢复默认生成方式
            // 将asyncFuns中的函数名替换为async函数名
            this.asyncFuns.forEach(fun => {
                code = code.replace(new RegExp(`(?<=^|\n)function ${fun}\(.*\)`, 'g'), `async $&`);
            });
            return `(async function(){\n${code}\n})();`
        } else return code;
    },
    init: function () {
        Blockly.JavaScript.forBlock['controls_do_then_return'] = function (block, generator) {
            const doWhat = generator.statementToCode(block, 'STM') || '';
            const returnWhat = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '';
            const code = `(${doWhat.includes('await')?'async': ''}()=>{\n${doWhat}\treturn ${returnWhat};\n})()`;
            return [code, generator.ORDER_ATOMIC];
        };

        Blockly.JavaScript.forBlock['procedures_defreturn'] = function (block, generator) {
            // Define a procedure with a return value.
            var funcName = generator.nameDB_.getName(
                block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
            var branch = generator.statementToCode(block, 'STACK');
            if (generator.STATEMENT_PREFIX) {
                branch = generator.prefixLines(
                    generator.STATEMENT_PREFIX.replace(/%1/g,
                        '\'' + block.id + '\''), generator.INDENT) + branch;
            }
            if (generator.INFINITE_LOOP_TRAP) {
                branch = generator.INFINITE_LOOP_TRAP.replace(/%1/g,
                    '\'' + block.id + '\'') + branch;
            }
            var returnValue = generator.valueToCode(block, 'RETURN',
                generator.ORDER_NONE) || '';
            if (returnValue) {
                returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
            }
            var args = [];
            for (var i = 0; i < block.arguments_.length; i++) {
                args[i] = generator.nameDB_.getName(block.arguments_[i],
                    Blockly.VARIABLE_CATEGORY_NAME);
            }
            var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
                branch + returnValue + '}';
            code = generator.scrub_(block, code);
    
            // 异步支持
            if (code.includes('await')) {
                window._asyncSuppport.asyncFuns.add(funcName);
                code = "async " + code;
            }
    
            // Add % so as not to collide with helper functions in definitions list.
            generator.definitions_['%' + funcName] = code;
            return null;
        };

        Blockly.JavaScript.forBlock['procedures_defnoreturn'] = function (block, generator) {
            var funcName = generator.nameDB_.getName(
                block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
            var branch = generator.statementToCode(block, 'STACK');
            if (generator.STATEMENT_PREFIX) {
                branch = generator.prefixLines(
                    generator.STATEMENT_PREFIX.replace(/%1/g,
                        '\'' + block.id + '\''), generator.INDENT) + branch;
            }
            if (generator.INFINITE_LOOP_TRAP) {
                branch = generator.INFINITE_LOOP_TRAP.replace(/%1/g,
                    '\'' + block.id + '\'') + branch;
            }
            var returnValue = generator.valueToCode(block, 'RETURN',
                generator.ORDER_NONE) || '';
            if (returnValue) {
                returnValue = generator.INDENT + 'return ' + returnValue + ';\n';
            }
            var args = [];
            for (var i = 0; i < block.arguments_.length; i++) {
                args[i] = generator.nameDB_.getName(block.arguments_[i],
                    Blockly.VARIABLE_CATEGORY_NAME);
            }
            var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
                branch + returnValue + '}';
            code = generator.scrub_(block, code);
    
            // 异步支持
            if (code.includes('await')) {
                window._asyncSuppport.asyncFuns.add(funcName);
                code = "async " + code;
            }
    
            // Add % so as not to collide with helper functions in definitions list.
            generator.definitions_['%' + funcName] = code;
            return null;
        };

        Blockly.JavaScript.workspaceToCode = function(workspace){
            return window._asyncSuppport.asyncWorkspaceToCode(workspace);
        };  // 不能直接写成赋值(Colipot说因为Blockly.JavaScript.workspaceToCode是个getter？)
    }
}
window._asyncSuppport.init();