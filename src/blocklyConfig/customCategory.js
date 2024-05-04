// 自定义toolbox
// 更多自定义角度参见：https://developers.google.com/blockly/reference/js/blockly.toolboxcategory_class
// 这个类重载了各种事件的回调，实现样式的初始化和切换，作用相当于有变量的css。如果不要求高度定制可以直接写css，各种伪类都能用
/* 一个category的组成：
<div class="blocklyToolboxCategory" role="treeitem" aria-selected="false" aria-level="1" aria-labelledby="blockly-2.label">
    <div class="blocklyTreeRow" id="blockly-2" style="padding-left: 0px; pointer-events: auto; background-color: rgb(91, 128, 165);">
        <div class="blocklyTreeRowContentContainer" style="pointer-events: none;">
            <img src="./logo_only.svg" alt="Blockly Logo" width="25" height="25" role="presentation">
            <span id="blockly-2.label" class="blocklyTreeLabel">%{BKY_CATLOGIC}</span>
        </div>
    </div>
</div>
 */
class CustomCategory extends Blockly.ToolboxCategory {
    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(categoryDef, toolbox, opt_parent) {
        super(categoryDef, toolbox, opt_parent);
    }

    /**
     * Adds the colour to the toolbox.
     * This is called on category creation and whenever the theme changes.
     * @override
     */
    addColourBorder_(colour) {
        // this.rowDiv_属于blocklyTreeRow类
        // 可以直接修改css而不创建类，但就不能根据category的定义改颜色。此处定义会覆盖css文件的定义
        this.rowDiv_.style.backgroundColor = colour;
        // 默认的addColourBorder_用border-left设置每个category的样式，即左边一条颜色
    }

    /**
     * Sets the style for the category when it is selected or deselected.
     * @param {boolean} isSelected True if the category has been selected,
     *     false otherwise.
     * @override
     */
    setSelected(isSelected) {
        // We do not store the label span on the category, so use getElementsByClassName.
        var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
        if (isSelected) {
            this.rowDiv_.style.backgroundColor = 'white';
            labelDom.style.color = this.colour_;
            labelDom.style.fontWeight = "bold";
            this.iconDom_.style.color = this.colour_;
        } else {
            this.rowDiv_.style.backgroundColor = this.colour_;
            labelDom.style.color = 'white';
            labelDom.style.fontWeight = "normal";
            this.iconDom_.style.color = 'white';
        }
        // This is used for accessibility purposes.
        Blockly.utils.aria.setState(/** @type {!Element} */(this.htmlDiv_),
            Blockly.utils.aria.State.SELECTED, isSelected);
    }

    /**
     * Creates the dom used for the icon.
     * @returns {HTMLElement} The element for the icon.
     * @override
     */
    createIconDom_() {
        const iconImg = document.createElement('img');
        iconImg.src = './style/logo_only.svg';  // 由于html引用了js，故按照html的位置写路径
        iconImg.alt = 'Blockly Logo';
        iconImg.width = '25';
        iconImg.height = '25';
        return iconImg;
    }
}

// 注册自定义类
Blockly.registry.register(  // https://developers.google.com/blockly/reference/js/blockly.registry_namespace.register_1_function
    Blockly.registry.Type.TOOLBOX_ITEM,         // The type of the plugin: string|Type<T>
    Blockly.ToolboxCategory.registrationName,   // The plugin's name: string
    CustomCategory,                             // The class or object to register
    true                                        // True to prevent an error when overriding an already registered item.
);