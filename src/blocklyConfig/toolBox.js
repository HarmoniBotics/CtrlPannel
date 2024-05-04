// {    // 带变量的写法 会自动创建变量，因此不用。改用LexicalVariable插件的变量系统
//     "kind": "block",
//     "type": "lists_indexOf",
//     "inputs": {
//         "VALUE": {
//             "block": {
//                 "type": "variables_get",
//                 "fields": {
//                     "VAR": "{listVariable}"
//                 }
//             }
//         }
//     }
// }
const toolbox = {
    "kind": "categoryToolbox",
    "contents": [
        // {   // 自定义toolbox项，具体该填什么规则看customToolBoxLabel.js 非常自由
        //     "kind": "toolboxlabel",
        //     "name": "自定义标签",
        //     "colour": "#00ff00"
        // },
        {
            "kind": "category",
            "name": "%{BKY_CATCONTROL}",
            "categorystyle": "control_category",    // 和"colour"互斥，用categorystyle便于在主题里统一更改
            "cssConfig":{},     // 用xml定义的属性<category 属性=""></category>在此处写
            "contents": [
                // {    // 用xml定义
                //     "kind": "block",
                //     "blockxml": "<block type='math_arithmetic'><field name='OP'>ADD</field></block>"
                // },
                // {    // 按钮和回调
                //     "kind": "button",
                //     "text": "A button",
                //     "callbackKey": "myFirstButtonPressed"    // 要注册：yourWorkspace.registerButtonCallback(yourCallbackKey, yourFunction)
                // },
                // {    // 标签
                //     "kind": "label",
                //     "text": "A label",
                //     "web-class": "myLabelStyle"
                // },
                /*  <style>
                    .myLabelStyle>.blocklyFlyoutLabelText {
                        font-style: italic;
                        fill: green;
                    }
                    </style>
                */
                // 与lexicalVariable的功能重复了
                // {
                //     "kind": "block",
                //     "type": "controls_repeat_ext",
                //     "inputs": {
                //         "TIMES": {
                //             "shadow": {
                //                 "type": "math_number",
                //                 "fields": {
                //                     "NUM": "10"
                //                 }
                //             }
                //         }
                //     }
                // },
                {
                    "kind": "block",
                    "type": "controls_whileUntil"
                },
                {
                    "kind": "block",
                    "type": "controls_for",
                    "inputs": {
                        "FROM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        },
                        "TO": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "10"
                                }
                            }
                        },
                        "BY": {
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
                    "type": "controls_forEach"
                },
                {
                    "kind": "block",
                    "type": "controls_for_each_dict"
                },
                {
                    "kind": "block",
                    "type": "controls_do_then_return"
                },
                {
                    "kind": "block",
                    "type": "controls_flow_statements"
                },
                {
                    "kind": "block",
                    "type": "controls_delay",
                    "inputs": {
                        "time": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1000"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_typeof"
                },
                {
                    "kind": "block",
                    "type": "controls_print",
                    "inputs": {
                        "msg": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "!"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_print",
                    "inputs": {
                        "TEXT": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_ignore_return"
                },
                {
                    "kind": "block",
                    "type": "controls_timeout",
                    "inputs": {
                        "time": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1000"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_interval",
                    "inputs": {
                        "time": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1000"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_clear_clock"
                },
                {
                    "kind": "block",
                    "type": "controls_eval",
                    "inputs": {
                        "js": {
                            "shadow": {
                                "type": "text_multiline"
                            }
                        }
                    }
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATLOGIC}",
            "categorystyle": "logic_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },
                {
                    "kind": "block",
                    "type": "logic_compare"
                },
                {
                    "kind": "block",
                    "type": "logic_operation"
                },
                {
                    "kind": "block",
                    "type": "logic_negate"
                },
                {
                    "kind": "block",
                    "type": "logic_boolean"
                },
                {
                    "kind": "block",
                    "type": "logic_null"
                },
                {
                    "kind": "block",
                    "type": "logic_ternary"
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATMATH}",
            "categorystyle": "math_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "math_number",
                    "fields": {
                        "NUM": "1"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_arithmetic",
                    "inputs": {
                        "A": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        },
                        "B": {
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
                    "type": "math_single",
                    "inputs": {
                        "NUM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "9"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_trig",
                    "inputs": {
                        "NUM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "45"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_constant"
                },
                {
                    "kind": "block",
                    "type": "math_number_property",
                    "inputs": {
                        "NUMBER_TO_CHECK": {
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
                    "type": "math_round",
                    "inputs": {
                        "NUM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "3.1"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_on_list"
                },
                {
                    "kind": "block",
                    "type": "math_modulo",
                    "inputs": {
                        "DIVIDEND": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "64"
                                }
                            }
                        },
                        "DIVISOR": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "10"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "math_constrain",
                    "inputs": {
                        "VALUE": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "50"
                                }
                            }
                        },
                        "LOW": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        },
                        "HIGH": {
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
                    "type": "math_random_int",
                    "inputs": {
                        "FROM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        },
                        "TO": {
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
                    "type": "math_random_float"
                },
                {
                    "kind": "block",
                    "type": "math_atan2",
                    "inputs": {
                        "X": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        },
                        "Y": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "1"
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATTEXT}",
            "categorystyle": "text_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "text"
                },
                {
                    "kind": "block",
                    'type': 'text_multiline'
                },
                {
                    "kind": "block",
                    "type": "text_join"
                },
                {
                    "kind": "block",
                    "type": "text_append",
                    "inputs": {
                        "TEXT": {
                            "shadow": {
                                "type": "text"
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_length",
                    "inputs": {
                        "VALUE": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_isEmpty",
                    "inputs": {
                        "VALUE": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": null
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_indexOf",
                    "inputs": {
                        "FIND": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_charAt"
                },
                {
                    "kind": "block",
                    "type": "text_getSubstring"
                },
                {
                    "kind": "block",
                    "type": "text_replace"
                },
                {
                    "kind": "block",
                    "type": "text_count"
                },
                {
                    "kind": "block",
                    "type": "text_reverse"
                },
                {
                    "kind": "block",
                    "type": "text_changeCase",
                    "inputs": {
                        "TEXT": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_trim",
                    "inputs": {
                        "TEXT": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "text_prompt_ext",
                    "inputs": {
                        "TEXT": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "abc"
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATLISTS}",
            "categorystyle": "list_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "extraState": {
                        "itemCount": 0
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_create_with"
                },
                {
                    "kind": "block",
                    "type": "lists_repeat",
                    "inputs": {
                        "NUM": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "5"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_concat",
                    "extraState": {
                        "itemCount": 2
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_length"
                },
                {
                    "kind": "block",
                    "type": "lists_isEmpty"
                },
                {
                    "kind": "block",
                    "type": "lists_isArray"
                },
                {
                    "kind": "block",
                    "type": "lists_indexOf"
                },
                {
                    "kind": "block",
                    "type": "lists_getIndex"
                },
                {
                    "kind": "block",
                    "type": "lists_setIndex"
                },
                {
                    "kind": "block",
                    "type": "lists_push",
                    "extraState": {
                        "itemCount": 1
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_splice",
                    "extraState": {
                        "itemCount": 1
                    },
                    "inputs": {
                        "deleteNum": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "0"
                                }
                            }
                        },
                        "at": {
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
                    "type": "lists_getSublist"
                },
                {
                    "kind": "block",
                    "type": "lists_split",
                    "inputs": {
                        "DELIM": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": ","
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "lists_sort"
                },
                {
                    "kind": "block",
                    "type": "lists_sort_diy"
                },
                {
                    "kind": "block",
                    "type": "lists_reverse"
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATDICTIONARIES}",
            "categorystyle": "dictionary_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "dictionaries_create_with",
                    "extraState": {
                        "itemCount": 0
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_create_with",
                    "extraState": {
                        "itemCount": 2
                    },
                    "inputs": {
                        "ADD0": {
                            "block": {
                                "type": "dictionaries_pair",
                                "inputs": {
                                    "KEY": {
                                        "shadow": {
                                            "type": "text",
                                            "fields": {
                                                "TEXT": "key1"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "ADD1": {
                            "block": {
                                "type": "dictionaries_pair",
                                "inputs": {
                                    "KEY": {
                                        "shadow": {
                                            "type": "text",
                                            "fields": {
                                                "TEXT": "key2"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_pair",
                    "inputs": {
                        "KEY": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "key"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_lookup"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_set_pair",
                    "inputs": {
                        "KEY": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "key"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_delete_pair",
                    "inputs": {
                        "KEY": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "key"
                                }
                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_recursive_lookup"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_recursive_set"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_getters"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_getters",
                    "fields": {
                        "OP": "values"
                    }
                },
                {
                    "kind": "block",
                    "type": "dictionaries_is_key_in"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_alist_to_dict"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_dict_to_alist"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_copy"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_combine_dicts"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_concat",
                    "extraState": {
                        "itemCount": 2
                    }
                },
                // {
                //     "kind": "block",
                //     "type": "dictionaries_walk_tree"
                // },
                // {
                //     "kind": "block",
                //     "type": "dictionaries_walk_all"
                // },
                {
                    "kind": "block",
                    "type": "dictionaries_is_dict"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_toJSON"
                },
                {
                    "kind": "block",
                    "type": "dictionaries_fromJSON"
                }
            ]
        },
        {
            "kind": "category",
            "name": "%{BKY_CATCOLOUR}",
            "categorystyle": "colour_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "colour_picker"
                },
                {
                    "kind": "block",
                    "type": "colour_random"
                },
                {
                    "kind": "block",
                    "type": "colour_rgb",
                    "inputs": {
                        "RED": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "100"
                                }
                            }
                        },
                        "GREEN": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "50"
                                }
                            }
                        },
                        "BLUE": {
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
                    "type": "colour_blend",
                    "inputs": {
                        "COLOUR1": {
                            "shadow": {
                                "type": "colour_picker",
                                "fields": {
                                    "COLOUR": "#ff0000"
                                }
                            }
                        },
                        "COLOUR2": {
                            "shadow": {
                                "type": "colour_picker",
                                "fields": {
                                    "COLOUR": "#3333ff"
                                }
                            }
                        },
                        "RATIO": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": "0.5"
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            "kind": "sep"
        },
        // {
        //     "kind": "category",
        //     "name": "%{BKY_CATVARIABLES}",
        //     "categorystyle": "variable_category",
        //     "contents": [],
        //     "custom": "VARIABLE"
        // },
        // {
        //     "kind": "category",
        //     "name": "%{BKY_CATFUNCTIONS}",
        //     "categorystyle": "procedure_category",
        //     "contents": [],
        //     "custom": "PROCEDURE"
        // }
        {
            "kind": "category",
            "name": "%{BKY_CATVARIABLES}",
            "categorystyle": "variable_category",
            "contents": [
                {
                    "kind": "block",
                    "type": "global_declaration"
                },
                {
                    "kind": "block",
                    "type": "local_declaration_statement"
                },
                {
                    "kind": "block",
                    "type": "local_declaration_expression"
                },
                {
                    "kind": "block",
                    "type": "lexical_variable_get"
                },
                {
                    "kind": "block",
                    "type": "lexical_variable_set"
                }
            ],
            // "custom": "VARIABLE"     // 用lexicalVariable插件需要屏蔽blockly本来提供的
        },
        {
            "kind": "category",
            "name": "%{BKY_CATFUNCTIONS}",
            "categorystyle": "procedure_category",
            "contents": [],
            "custom": "PROCEDURE"
        }
    ]
}