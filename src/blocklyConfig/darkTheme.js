// 自定义颜色主题 仿appinventor的Dark主题
Blockly.Themes.Custom = Blockly.Theme.defineTheme('custom', {
    'base': Blockly.Themes.Classic,
    'categoryStyles': {
        'control_category': {
            'colour': "#cfac4b"
        },
        'logic_category': {
            'colour': "#88b652"
        },
        'math_category': {
            'colour': "#4f86c2"
        },
        'text_category': {
            'colour': "#c24471"
        },
        'list_category': {
            'colour': "#58b5dc"
        },
        'dictionary_category': {
            'colour': "#2d1799"
        },
        'colour_category': {
            'colour': "#909090"
        },
        'variable_category': {
            'colour': "#db743a"
        },
        'procedure_category': {
            'colour': "#8f6997"
        }
    },
    'blockStyles': {  // "xxx_blocks"在块定义中用"style"指定
        'control_blocks': {
            'colourPrimary': "#B18E35",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#c8b072"
        },
        'loop_blocks': {    // 官方内置块，虽然都以"control"开头，但是却用了loop的style名 已经被我加入control类了
            'colourPrimary': "#B18E35",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#c8b072"
        },
        'logic_blocks': {
            'colourPrimary': "#77ab41",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#a0c47a"
        },
        'math_blocks': {
            'colourPrimary': "#3f71b5",
            'colourTertiary': "#799ccb"
        },
        'text_blocks': {
            'colourPrimary': "#b32d5e",
            'colourSecondary': "#e1abbf",
            'colourTertiary': "#ca6c8e"
        },
        'list_blocks': {
            'colourPrimary': "#49a6d4",
            'colourSecondary': "#b6dbee",
            'colourTertiary': "#80c1e1"
        },
        'dictionary_blocks': {
            'colourPrimary': "#2d1799",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#5c4cb0"
        },
        'colour_blocks': {
            'colourPrimary': "#646464",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#a4a4a4"
        },
        'variable_blocks': {
            'colourPrimary': "#d05f2d",
            'colourSecondary': "#a0a0a0",
            'colourTertiary': "#de8f6c"
        }
    },
    'componentStyles': {
        'workspaceBackgroundColour': '#1e1e1e',
        'toolboxBackgroundColour': 'blackBackground',
        'toolboxForegroundColour': '#fff',
        'flyoutBackgroundColour': '#252526',
        'flyoutForegroundColour': '#ccc',
        'flyoutOpacity': 1,
        'scrollbarColour': '#797979',
        'insertionMarkerColour': '#fff',
        'insertionMarkerOpacity': 0.3,
        'scrollbarOpacity': 0.4,
        'cursorColour': '#d0d0d0',
        'blackBackground': '#333',
    },
    'fontStyle': {
        // 'family': 'Georgia, serif',
        // 'weight': 'bold',
        'size': 12
    },
    'startHats': true
});