# 口琴机器人上位机
基于Google Blockly库的机器人图形化编程上位机，契合“教育”的目的。[在线使用](https://harmonibotics.github.io/CtrlPannel/)<br>
框架来自于[BlocklyTemplate](https://github.com/madderscientist/BlocklyTemplate)，对原生Blockly进行了改造，并去npm化，使之开发与使用无需配置。<br>
下面将就“口琴机器人”方面展开介绍。

## 通信协议
所有通信的发起都是上位机。下位机都有应答。一帧(frame)固定12个字节：
| 字节序号 | 描述 |
| ------- | ---- |
| 0 | 发送设备的设备识别码 |
| 1 | 命令类型 |
| 2~9 | 数据 |
| 10 | 保留 |
| 11 | 接收设备的设备识别码 |

### 设备识别码
| 设备类型名称 | 识别码 |
| ----------- | ----- |
| 单片机: SlaveBoard | 0x88 |
| 单片机: MasterBoard | 0x?? |
| 上位机: 电脑 | 0x66 |

### 连接建立
| 设备1 | 方向 | 命令类型 | 数据 | 设备2 |
| -- | -- | -- | -- | -- |
| 上位机 | → | 0x10(请求连接) | - | 下位机 |
| 上位机 | ← | 0x11(回应请求) | - | 下位机 |
| 上位机 | → | 0x12(检查连接) | - | 下位机 |
| 上位机 | ← | 0x12(回应检查) | - | 下位机 |

建立了连接之后，上位机可以周期性发送0x12检查连接性，而不必从0x10开始。

### 演奏音符
| 设备1 | 方向 | 命令类型 | 数据 | 设备2 |
| -- | -- | -- | -- | -- |
| 上位机 | → | 0x31(演奏音符) | 音符编号 | 下位机 |
| 上位机 | ← | 0x31(回应请求) | 音符编号 | 下位机 |

音符编号：
- 休止符编码：0x00
- 带#号的音符，即要按推键的，编码是原编码加上0x40偏移量
- 音符的八度用5~8bit表示（如下表）
- 自然大调音阶用1~4bit表示（如下表）

数字谱音符|数据编码|数字谱音符|数据编码|数字谱音符|数据编码
| -- | -- | -- | -- | -- | -- |
(1) | 0x01 | 1 | 0x11 | [1] | 0x21
(2) | 0x02 | 2 | 0x12 | [2] | 0x22
(3) | 0x03 | 3 | 0x13 | [3] | 0x23
(4) | 0x04 | 4 | 0x14 | [4] | 0x24
(5) | 0x05 | 5 | 0x15 | [5] | 0x25
(6) | 0x06 | 6 | 0x16 | [6] | 0x26
(7) | 0x07 | 7 | 0x17 | [7] | 0x27

### 强度更改
| 设备1 | 方向 | 命令类型 | 数据 | 设备2 |
| -- | -- | -- | -- | -- |
| 上位机 | → | 0x32(更改强度) | 强度 | 下位机 |
| 上位机 | ← | 0x32(回应请求) | 强度 | 下位机 |

强度取值：0~4095，用两个byte表示，地址由小到大表示高八位和低八位，即：
- frame[2] = Intensity >> 8
- frame[3] = Intensity & 0xFF

## 上位机串口设计
基于Web Serial API，核心代码为src\robotSerial.js。使用队列缓存要发送的数据，没做溢出忽略。每次发送都会临时创建writer和reader。使用了大量的异步操作，封装了常用的命令，可以使用.then.catch进行链式处理，也可以使用await try catch的组合。如果发送失败或者ack的命令类型不对，则reject（视为错误），在catch中可以捕获这个错误。