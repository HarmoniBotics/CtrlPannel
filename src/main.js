Object.prototype.toString = function () {
    try {
        return JSON.stringify(this);
    } catch (e) {
        return '[object Object]';
    }
}

var workspace = null;
// 默认打开的是untitled。保存则清空untitled的保存内容，更新codeTitle。新建则清空untitled。
var codeTitle = '';
function setCodeTitle(newTitle) {
    codeTitle = newTitle;
    document.getElementById('loadButton').innerHTML = newTitle;
}

(function () {
    // 初始化界面
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        theme: Blockly.Themes.Custom,
        media: './media',
        trashcan: true,
        grid: {
            spacing: 25,
            length: 3,
            colour: '#666',
            snap: true
        },
        zoom: {
            controls: true,
            wheel: true
        }
    });
    // 变量插件 必须先<script src="./core/lexicalVariable.js">
    // 如果不想用，可以直接将toolbox中的"custom": "VARIABLE"取消注释
    LexicalVariables.init(workspace);

    // 向动态类别"PROCEDURE"添加自定义块
    let defaultProcedureBlocks = workspace.toolboxCategoryCallbacks.get("PROCEDURE");
    workspace.registerToolboxCategoryCallback('PROCEDURE',
        function (workspace) {
            var c = defaultProcedureBlocks(workspace);
            c.length && c[c.length - 1].setAttribute("gap", "16");  // defaultProcedureBlocks最后设置了距离，所以还原
            if (Blockly.Blocks.procedure_get) {
                let d = document.createElement("block");
                d.setAttribute("type", "procedure_get");
                d.setAttribute("gap", "16");
                c.push(d);
            }
            if (Blockly.Blocks.procedure_call_by_name) {
                let d = document.createElement("block");
                d.setAttribute("type", "procedure_call_by_name");
                d.setAttribute("gap", "16");

                // 添加默认连接块 仿照xml定义toolbox设置dom
                let value = document.createElement('value');
                value.setAttribute("name", "PARAMS");
                d.appendChild(value);

                let listBlock = document.createElement('block');
                listBlock.setAttribute("type", "lists_create_with");
                value.appendChild(listBlock);

                let mutation = document.createElement('mutation');
                mutation.setAttribute("items", "0");
                listBlock.appendChild(mutation);

                c.push(d);
            }
            c.length && c[c.length - 1].setAttribute("gap", "24");
            return c;
        }
    );

    // 背包插件 必须先<script src="./core/backpack.js">
    const backpack = new Backpack(workspace, {
        allowEmptyBackpackOpen: true,
        useFilledBackpackImage: true,
        contextMenu: {
            emptyBackpack: true,
            removeFromBackpack: true,
            copyToBackpack: true,
            copyAllToBackpack: false,
            pasteAllToBackpack: false,
            disablePreconditionChecks: false
        },
    });   // 必须在加载workspace内的块(比如load)前调用
    backpack.init();    // backpack有个bug，看backpack文件夹下的README

    // 加载untitled项目（默认项目）
    setCodeTitle('untitled');
    load(workspace, codeTitle);

    // 绑定全局事件
    workspace.addChangeListener((e) => {    // 自动保存
        if (e.isUiEvent) return;    // UI events are things like scrolling, zooming, etc. No need to save after one of these.
        save(workspace, codeTitle);
    });
    // 绑定按钮事件·与blocklyTemplate不同
    bindClick('runButton', (e) => {
        if(!robotSerial.port && !confirm("尚未连接到机器人，是否继续？")) return;
        run(e);
    });
    bindClick('clearButton', () => {  // 删除全部
        var count = workspace.getAllBlocks(false).length;
        if (count < 2 || window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
            workspace.clear();
            if (window.location.hash) {
                window.location.hash = '';
            }
        }
    });
    bindClick('saveButton', saveCode);
    bindClick('exportButton', exportCode);
    bindClick('loadButton', () => {
        if (!loadProjects.getStatus()) {
            // 删除所有子元素
            loadProjects.ul.querySelectorAll('li').forEach(li => {
                li.remove();
            });
            // 根据缓存加载列表项
            let keys = Object.keys(window.localStorage);
            keys.forEach(k => {
                if (k != "untitled") {
                    loadProjects.add(k, (title) => {
                        setCodeTitle(title);
                        load(workspace, codeTitle);
                    }, (title) => {
                        window.localStorage.removeItem(title);
                        setCodeTitle('untitled');
                        load(workspace, codeTitle);
                    });
                }
            });
            loadProjects.show();
        }
    });
    bindClick('newButton', () => {
        if (codeTitle == "untitled") {
            if (Object.keys(Blockly.serialization.workspaces.save(workspace)).length > 2) {    // 有代码
                if (!confirm("当前代码未保存。是否丢弃？")) return;
            }
        }
        workspace.clear();
        setCodeTitle('untitled');
        window.localStorage["untitled"] = {};
    });
})();

function bindClick(el, func) {  // 意义在于处理按钮的touch和click事件，防止触发两次
    if (typeof el === 'string') {
        el = document.getElementById(el);
    }
    el.addEventListener('click', func, true);
    function touchFunc(e) {
        // Prevent code from being executed twice on touchscreens.
        e.preventDefault();
        func(e);
    }
    el.addEventListener('touchend', touchFunc, true);
};

function run(event) {
    // Prevent code from being executed twice on touchscreens.
    if (event.type === 'touchend') {
        event.preventDefault();
    }
    Blockly.JavaScript.INFINITE_LOOP_TRAP = 'checkTimeout();\n';
    var timeouts = 0;
    var checkTimeout = function () {
        if (timeouts++ > 1000000) {
            throw MSG['timeout'];
        }
    };
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;   // 每次都重置循环超时的检测
    try {
        console.log(code)
        eval(code);
    } catch (e) {
        alert(e);
    }
}

function saveCode() {
    while (true) {
        let userInput = prompt("另存为 项目名称:", getDateStr());
        if (typeof userInput != "string") return;  // 点击了"取消"
        if (userInput.length == 0) {
            alert('请输入项目名！');
        } else if (userInput in window.localStorage) {
            alert('名称已存在！');
        } else {
            setCodeTitle(userInput);
            break;
        }
    }
    save(workspace, codeTitle);
}

function exportCode() {
    const fileName = `${codeTitle}_${getDateStr()}`;
    const blob = new Blob([window.localStorage?.getItem(codeTitle)], {
        type: "application/json;charset=utf-8"
    });
    const href = URL.createObjectURL(blob);
    const alink = document.createElement("a");
    alink.style.display = "none";
    alink.download = fileName; // 下载后文件名
    alink.href = href;
    alink.click();
    URL.revokeObjectURL(href);          // 释放blob对象
}

function uploaded(files) {
    if (typeof files != 'object') return;
    let lastfile = true;
    for (let i = 0; i < files.length; i++) {
        if (files[i].type == 'application/json') {
            let fileName = files[i].name.slice(0, -5);
            let blockName = fileName;
            let count = 1;
            while (blockName in window.localStorage) {
                blockName = `${fileName}(${count++})`;
            }
            let reader = new FileReader();
            try {
                reader.readAsText(files[i]);
                reader.onload = function () {
                    window.localStorage?.setItem(blockName, this.result);
                    if (lastfile) {
                        setCodeTitle(blockName);
                        load(workspace, codeTitle);
                        lastfile = false;
                    }
                }
            }
            catch (err) {
                alert(err);
            }
        }
    }
}

// 调试使用，查找Blockly的属性
function hasKey(obj, key, path = '') {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        console.log(path); // 输出路径
        return true;
    }

    for (var prop in obj) {
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
            if (path === '') {
                if (hasKey(obj[prop], key, prop)) {
                    return true;
                }
            } else {
                if (hasKey(obj[prop], key, path + '.' + prop)) {
                    return true;
                }
            }
        }
    }

    return false;
}