class robotSerial {
    // ========= 消息相关 ========= //
    /**
     * 解析ACK数组
     * @param {Uint8Array[12]} ack ack数组
     * @returns 如果发送方不是单片机、接收方不是上位机则返回false；否则解析出type和data
     */
    static parseACK(ack) {
        if (ack[0] != 0x88 || ack[11] != 0x66) return false;
        return {
            type: ack[1],
            data: ack.slice(2, 12)
        };
    }
    // 全局配置
    static msgSetting = {
        // 帧格式：发送方标识符 | 消息类型 | 数据[8] | 保留byte | 接收方标识符
        data: new Uint8Array([0x66, 0x12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x88]),
        ackByteNum: 12,         // 这是协议定义好的
        messageTimeout: 100,
        retryNum: 2,
        callback: (ack) => {
            if (!ack) {
                console.error("发送失败");
            } else {
                result = robotSerial.parseACK(ack);
                if (result) console.log(result);
                else console.error("接收错误");
            }
        }
    }
    /**
     * 构造一个消息 不传则用默认值(msgSetting)中的值
     * @param {Function} callback 接收到ack之后的回调函数 传参为ack数组
     * @param {Number} type 类型 协议定义 可以不传
     * @param {Array[8]} data 该类型消息的数据 可以不传
     * @param {Number} ackByteNum 可以不传
     * @param {Number} messageTimeout 可以不传
     * @param {Number} retryNum 
     * @returns msg
     */
    static MSG(callback, type, data, ackByteNum, messageTimeout, retryNum) {
        let Data = new Uint8Array(robotSerial.msgSetting.data);
        if (type !== undefined) Data[1] = type;
        if (data !== undefined) Data.set(data, 2);
        return {
            data: Data,
            ackByteNum: ackByteNum !== undefined ? ackByteNum : robotSerial.msgSetting.ackByteNum,
            messageTimeout: messageTimeout !== undefined ? messageTimeout : robotSerial.msgSetting.messageTimeout,
            retryNum: retryNum !== undefined ? retryNum : robotSerial.msgSetting.retryNum,
            callback: callback !== undefined ? callback : robotSerial.msgSetting.callback
        };
    }
    // 可以用.then处理结果的回调 发送失败/响应错误都会调用reject 用await调用这些函数应该用try catch结构
    static asyncCallback = (type, resolve, reject) => {
        return (ack) => {
            if (!ack) reject("发送失败");
            else {
                let result = robotSerial.parseACK(ack);
                if (result && result.type == type) resolve(result);
                else reject("接收错误");
            }
        };
    }
    // 发送一个命令
    cmd(type, data, ackByteNum, messageTimeout, retryNum) {
        return new Promise((resolve, reject) => {
            this.send(robotSerial.MSG(
                robotSerial.asyncCallback(type, resolve, reject),
                type, data, ackByteNum, messageTimeout, retryNum
            ));
        });
    }
    // ========== 特定消息 =========//
    confirm() { // 可以周期性发送，确认是否建立了连接
        return this.cmd(0x12);
    }
    setup() {   // 从0到1建立连接的流程
        // 这里接收和发送的消息类型不同，所以不能用cmd()
        return new Promise((resolve, reject) => {
            this.send(robotSerial.MSG(robotSerial.asyncCallback(0x11, resolve, reject), 0x10));
        }).then(() => {
            return this.confirm();
        });
    }
    note(note) {    // 演奏一个音符
        return this.cmd(0x31, [note]);
    }
    intensity(intensity) {  // 强度变化
        return this.cmd(0x32, [intensity >> 8, intensity & 0xFF]);
    }

    // ========= 串口相关 ========= //
    constructor(BaudRate = 115200, StopBits = 1, DataBits = 8) {
        if ('serial' in navigator) {
            this.port = null;
            this.baudRate = BaudRate;
            this.dataBits = DataBits;
            this.stopBits = StopBits;
            this.queue = [];    // 消息队列
            this.sending = false;   // 判断当前是否正在发送
        } else {
            alert('不支持串口');
            return null;
        }
    }
    async connect() {
        await this.closePort();
        if (!(await this.autoPort()) && !(await this.selectPort())) return null;
        await this.open();
        return this.port;
    }

    //== 获取port ==//
    async autoPort() {
        console.log("getPort");
        // getPorts会从现有的ports中找到已经连过的串口，以Array的形式返回
        let availablePorts = await navigator.serial.getPorts();
        // 如果现有的连接中没有之前连接过的，返回的是空列表
        this.port = availablePorts.length > 0 ? availablePorts[0] : null;
        return this.port;
    }
    async selectPort() {
        console.log("selectPort");
        try {    // requestPort如果用户点击取消，会抛出异常
            this.port = await navigator.serial.requestPort();
        } catch (e) {
            console.log(e);
            this.port = null
        }
        return this.port;
    }
    // 打开串口 需要先获得端口port
    async open() {
        await this.port.open({
            baudRate: this.baudRate,    // 一个正的、非零的值，表示串口通信应该建立的波特率
            dataBits: this.dataBits,    // 7或8的整数值，表示每帧的数据位数。默认值为8
            stopBits: this.stopBits,    // 1或2的整数值，表示帧结束时的停止位数。默认值为1。
            parity: 'none',     // 奇偶校验模式为“none”、“偶”或“奇”。默认值为none。
            bufferSize: 255,    // 一个无符号长整数，指示要建立的读和写缓冲区的大小。如果未通过，默认值为255。
            flowControl: 'none' // 流控制类型，“none”或“hardware”。默认值为none。
        });
    }
    // 关闭当前串口的所有接口
    async closePort() {
        this.port && await this.port.close();
        this.port = null;
    }

    // ==== 发送相关 ==== //
    /**
     * 同步发送消息(加await可同步) 使用时需要保证上一次的发送已经结束
     * @param {Uint8Array} data 要发送的数据(一帧的所有数据)
     * @param {Number} ackByteNum ack字节数
     * @param {Number} messageTimeout 超时的毫秒数
     * @param {Number} retryNum 重试的次数 指失败后再尝试发送几次
     * @returns {Array} ack数组 接收失败则返回null
     */
    async _send(data, ackByteNum = 0, messageTimeout = 100, retryNum = 0) {
        // 关闭全局reader，使用临时reader和writer this.closeLoopReader();
        // 发送
        const writer = this.port.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();   // Streams API的规范：一个流在任何时刻只能有一个激活的writer。如果尝试在一个writer还没有被释放（通过调用writer.releaseLock()）的情况下创建另一个writer，将会抛出一个错误
        // 接收
        let ack = null;
        for (let i = 0; i < retryNum + 1; i++) {
            let reader = this.port.readable.getReader();
            try {
                // 超时处理
                const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error("消息超时"));
                    }, messageTimeout);
                });
                // 接收固定位数的ACK
                const receiveACK = async () => {
                    let received = [];
                    while (received.length < ackByteNum) {      // 直到收到了ackBitNum个数据才算结束。否则循环接收。
                        const { value } = await reader.read();
                        received.push(...value);                // value是Uint8Array，只能这样合并
                    }
                    // 多余的数据存入this.buffer, ackByteNum位数据返回【取消了buffer】
                    // this.buffer.push(...received.slice(ackByteNum));
                    return received.slice(0, ackByteNum);
                }
                ack = await Promise.race([receiveACK(), timeoutPromise]);   // 如果触发timeout的rejuect，则ack不会被赋值，直接跳转到catch
            } catch (e) {
                console.log(`${e.message}\n剩余重发次数:${retryNum - i}`);
            } finally {
                reader.releaseLock();   // 需要及时release，否则影响下一个循环的读取
                if (ack) break;
            }
        }
        return ack;
    }

    /**
     * 异步处理消息队列 直到队列为空
     * @param {Object} msg 同send
     */
    async loopsend(msg) {
        let ack = await this._send(msg.data, msg.ackByteNum, msg.messageTimeout, msg.retryNum);
        msg.callback(ack);
        if (this.queue.length) {
            this.sending = true;
            let nextmsg = this.queue.shift();
            this.loopsend(nextmsg);     // 不用await，事件进入队列，不会爆栈
        } else {
            this.sending = false;
        }
    }
    /**
     * 异步发送一个消息
     * @param {Object} msg {
     *  data: Uint8Array,
     *  ackByteNum: Number,
     *  messageTimeout: Number,
     *  retryNum: Number,
     *  callback: Function
     * }
     */
    send(msg) {
        if (this.sending) {
            this.queue.push(msg);
        } else {
            this.sending = true;
            this.loopsend(msg);
        }
    }
}