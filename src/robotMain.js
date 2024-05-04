// 需要在main.js之后引入
// 命令行动作 负责UI逻辑
var ConsolePannel = {
    commandIn: null,
    sendCommand: null,
    commandMsg: null,
    old_console: null,
    context: {},
    init: function () {
        this.commandIn = document.getElementById('commandIn');
        this.sendCommand = document.getElementById('sendCommand');
        this.commandMsg = document.getElementById('commandMsg');
        this.old_console = {
            log: console.log,
            error: console.error,
        }
        this.consoleOnDiv(true);
        this.sendCommand.onclick = () => {
            this.sendCMD(this.commandIn.value);
        };
        document.addEventListener('keydown', function (event) {
            if (commandIn === document.activeElement && event.key === 'Enter') {
                sendCommand.click();
            }
        });
        document.getElementById('ifOnScreen').onchange = () => {
            this.consoleOnDiv(document.getElementById('ifOnScreen').checked);
        };
    },
    sendCMD: function (command) {  // !! 重要函数
        this.toScreen('<span style="color:lightgreen">[user] </span>' + command);
        try {
            this.commandParser(command);
        } catch (e) {
            console.error(e);
        }
        this.commandIn.value = '';
    },
    // 将console输出到div
    consoleOnDiv: function (enable = true) {
        if (enable) {
            console.log = (message) => {
                this.toScreen('<span style="color:lightblue">[console] </span>' + message);
                this.old_console.log(message);
            };
            console.error = (message) => {
                this.toScreen('<span style="color:red">[console] </span>' + message);
                this.old_console.error(message);
            };
        } else {
            console.log = this.old_console.log;
            console.error = this.old_console.error;
        }
    },
    toScreen: function (msg) {
        this.commandMsg.innerHTML += msg.replace(/\n/g, "<br>") + '<br>';
        // this.commandMsg.innerHTML += msg + '\n';
    },
    commandParser(cmd) {
        let args = cmd.split(' ');
        switch (args[0]) {
            case 'confirm':
                if (args.length > 1) console.error('confirm指令不需要参数');
                if (!robot.port && !confirm("尚未连接到机器人，是否继续？")) return;
                else {
                    robot.confirm()
                    .then(() => console.log('验证成功'))
                    .catch(() => console.error('验证失败'));
                } return;
            case 'note':
                if (args.length != 2) console.error('note指令需要一个参数');
                if (!robot.port && !confirm("尚未连接到机器人，是否继续？")) return;
                else {
                    robot.note(parseInt(args[1]))
                    .then(() => console.log('发送成功'))
                    .catch(() => console.error('发送失败'));
                } return;
            case 'notelist':
                if (args.length > 1) console.error('notelist指令不需要参数');
                console.log('\n' +
                    '=======音符代码表=======\n' +
                    'C4 0x01,\tC5 0x11,\tC6 0x21\n' +
                    'D4 0x02,\tD5 0x12,\tD6 0x22\n' +
                    'E4 0x03,\tE5 0x13,\tE6 0x23\n' +
                    'F4 0x04,\tF5 0x14,\tF6 0x24\n' +
                    'G4 0x05,\tG5 0x15,\tG6 0x25\n' +
                    'A4 0x06,\tA5 0x16,\tA6 0x26\n' +
                    'B4 0x07,\tB5 0x17,\tB6 0x27\n' +
                    '推键则加上0x40\n'
                ); return;
            case 'intensity':
                if (args.length != 2) console.error('intensity指令需要一个参数');
                if (!robot.port && !confirm("尚未连接到机器人，是否继续？")) return;
                else {
                    robot.intensity(parseInt(args[1]))
                    .then(() => console.log('发送成功'))
                    .catch(() => console.error('发送失败'));
                } return;
            case 'help':
                console.log('\n' +
                    '=======指令表=======\n' +
                    'confirm: 验证连接\n' +
                    'note: 发送音符\n' +
                    '  | 参数：音符代码\n' +
                    '  | 举例：note 0x13\n' +
                    'notelist: 音符代码列表\n' +
                    'itensity: 强度\n' +
                    '  | 参数：16位的强度值\n' +
                    '  | 举例：intensity 0x1000\n' +
                    'clear: 清屏\n'
                ); return;
            case 'clear':
                if (args.length > 1) console.error('clear指令不需要参数');
                else this.commandMsg.innerHTML = '';
                return;
            default:
                eval.call(this.context, cmd);
        }
    }
};

(function () {
    bindClick('connectButton', async function () {
        if (this.innerHTML == "Connect") {
            if (!await robot.connect()) {
                console.error('串口打开失败');
                this.innerHTML = 'Connect';
                return;
            }
            try {
                await robot.setup();
                console.log("口琴机器人连接成功");
                this.innerHTML = "断开";
            } catch(e) {
                console.error(e+' 通信建立失败');
                this.innerHTML = "Connect";
            }
        } else {
            robot && robot.closePort().then(() => {
                this.innerHTML = "Connect";
                console.log('连接关闭')
            });
        }
    });
    // 分栏可变
    let separateBar = document.getElementById('separateBar');
    let commandLine = document.getElementById('commandLine');
    let resize = (e) => {
        let x = e.clientX;
        if (x == undefined) x = e.touches[0].clientX;
        if (x) {
            let newWidth = document.body.clientWidth - x;
            if (newWidth < 100) {
                newWidth = '0px';
                commandLine.style.display = 'none';
            } else {
                commandLine.style.display = 'flex';
                if (newWidth < 200) {
                    newWidth = '200px';
                } else newWidth += 'px';
            }
            commandLine.style.width = newWidth;
            separateBar.style.left = newWidth;
            Blockly.svgResize(workspace);
        }
    }
    separateBar.addEventListener('mousedown', (e) => {
        document.addEventListener('mousemove', resize);
    });
    document.addEventListener('mouseup', (e) => {
        document.removeEventListener('mousemove', resize);
    });

    separateBar.addEventListener('touchstart', (e) => {
        document.addEventListener('touchmove', resize);
    });
    document.addEventListener('touchend', (e) => {
        document.removeEventListener('touchmove', resize);
    });

    window.ConsolePannel.init();
})();