// 为toolbox添加自定义项 和category同一个层级 在toolbox结构中直接添加"kind:'toolboxlabel'"项就可以使用
class ToolboxLabel extends Blockly.ToolboxItem {
    /**
     * Constructor for a label in the toolbox.
     * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef The toolbox
     *    item definition. This comes directly from the toolbox definition.
     * @param {!Blockly.IToolbox} parentToolbox The toolbox that holds this
     *    toolbox item.
     * @override
     */
    constructor(toolboxItemDef, parentToolbox) {
        super(toolboxItemDef, parentToolbox);
        /**
         * The button element.
         * @type {?HTMLLabelElement}
         */
        this.label = null;
    }

    /**
     * Init method for the label.
     * @override
     */
    init() {
        // Create the label.
        this.label = document.createElement('label');
        // Set the name.
        this.label.textContent = this.toolboxItemDef_['name'];  // 用name属性代替内容
        // Set the color.
        this.label.style.color = this.toolboxItemDef_['colour'];
        // 添加类名,方便在css中控制样式 通过cssConfig中label标签添加
        const cssConfig = this.toolboxItemDef_['cssConfig'];
        if (cssConfig) {
            this.label.classList.add(cssConfig['label']);
        }
    }

    /**
     * Gets the div for the toolbox item.
     * @returns {HTMLLabelElement} The label element.
     * @override
     */
    getDiv() {
        return this.label;
    }
}

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    'toolboxlabel',
    ToolboxLabel
);
