// 定义右键菜单
/* 一个选项的模版
{
    displayText: function(scope){       // 可以是函数，可以是字符串，为右键菜单此选项显示的字符
        if (scope.block.type.startsWith('text')) {
            return 'Text block';
        } else if (scope.block.type.startsWith('controls')) {
            return 'Controls block';
        } else {
            return 'Some other block';
        }
    },
    preconditionFn: function(scope) {   // 选项的状态：enable disable hidden
        if (scope.block.outputConnection) {
            return 'enabled';
        }
        return 'hidden';
    },
    callback: function(scope) {         // 选项功能
        Blockly.serialization.blocks.append({
            'type': 'text',
            'fields': {
                'TEXT': 'Now there is a block'
            }
        });
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK, // 或者WORKSPACE, 右击谁会出现这个选项
    id: 'hello_world',                  // 用于unregister这个选项：Blockly.ContextMenuRegistry.registry.unregister('hello_world');
    weight: 100                         // 越小，右键菜单中位置越靠上
}*/

// 初始化右键菜单
;(function () {
    const contextMunu = [
        {
            displayText: 'Help! There are no blocks',
            preconditionFn: function (scope) {
                if (!scope.workspace.getTopBlocks().length) {
                    return 'enabled';
                }
                return 'hidden';
            },
            callback: function (scope) {
                Blockly.serialization.blocks.append({
                    'type': 'text',
                    'fields': {
                        'TEXT': 'Now there is a block'
                    }
                }, scope.workspace);
            },
            scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
            id: 'help_no_blocks',
            weight: 100,
        }
    ];
    for (const item of contextMunu)
        Blockly.ContextMenuRegistry.registry.register(item);
})();