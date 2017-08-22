# 概览
这是一个多人在线的即时H5游戏，玩法类似手机上流行的球球大作战，用于前端入门。
![Scerenshot](https://raw.githubusercontent.com/lolBig/ball/master/screenshot.png)
# 构建

- 服务端
```
cd svr/
npm install
vim deploy.js #把各个地址替换成自己的。
node app.js #或者pm2 start deploy.json
```
- 客户端
```
cd cli/
npm install
vim package.json #将webpack-dev-server中的--host替换成自己或者去掉。
npm run dev #或者npm run deploy
```

# 实现
- 客户端
    - 分为登录、世界、游戏三个场景，采用传统的分层架构，分为Renderer、Manager和Logic，没有使用Redux。Renderer采用React，游戏内的地图和实体等通过Canvas渲染，目前手头上的设备除了UC浏览器维持在35-45帧（不知道哪个地方姿势不对），其它的基本可以跑满。
    - 长连接采用websocket。
    - AJAX请求通过CORS跨域。
    - Icon采用SVG Symbol。
    - 样式通过less进行预处理。
    - 针对Renderer做了基本的响应式设计。
    - 使用Webpack进行构建。
- 服务端
    - 采用NodeJS，核心逻辑比较简单，主要就是负责广播逻辑帧。
    - 分为世界、聊天、游戏三个服务器。
    - HTTP请求采用Express进行路由。
    - 数据没有落地，全部在内存。
- 帧同步
    - 实时游戏一般采用帧同步和状态同步进行客户端的同步，这里采用的是帧同步。
        - 客户端分为渲染帧和逻辑帧。渲染帧就是平常的UI渲染，这个部分能跑多快就跑多块，Canvas的渲染通过requestAnimationFrame，DOM的渲染则交给React；逻辑帧是100ms一次，负责AI、碰撞检测之类的逻辑处理（这部分如果计算量非常大可以开一个Worker线程，目前通过一些优化之后，页面每帧的idel时间比例很大，所以没有放到Worker）。
        - 逻辑帧的时间同步跟游戏类型相关。如果游戏操作的灵敏度较高，比如CS这种FPS游戏，这个时间需要调得更低，否则客户端会有明显操作延迟；但是如果是炉石这种卡牌游戏，同步时间调成1000ms，客户端也不会有很明显的延迟感觉。
        - 服务端每隔一段时间把客户端上传的指令合并成一个逻辑帧广播到客户端，客户端负责执行广播下来的逻辑帧指令。
        - 因为所有逻辑都放在客户端执行，所以服务器压力比起状态同步来说小很多。但是因为客户端有游戏内的所有数据，所以防作弊就比较麻烦，比如Dota1里面的全图挂。
        - 通过快进的方式进行断线重连或者中途加入。
        - 录像只保存玩家指令，replay的时候按时间点播放，所以一个录像文件非常小。
        - 每个客户端之间所有跟逻辑相关的处理都必须在相同的时间，同时浮点数，随机数，排序，内存分配等的处理也需要保持一致性，否则一个地方错了，将引起连锁反应导致后面全是错的，而且复现是非常非常困难的。
        - 通过对客户端上传的数据比对来进行最终的结算。

# 客户端结构
- cache*.js 缓存
    - [cache_mem.js](https://github.com/lolBig/ball/blob/master/cli/cache_mem.js) 内存
    - [cache.js](https://github.com/lolBig/ball/blob/master/cli/cache.js) 离线
- [device.js](https://github.com/lolBig/ball/blob/master/cli/device.js) 设备信息
- [display.js](https://github.com/lolBig/ball/blob/master/cli/display.js) 场景控制
- [event_dispatcher.js](https://github.com/lolBig/ball/blob/master/cli/event_dispatcher.js) 事件管理
- [global.js](https://github.com/lolBig/ball/blob/master/cli/global.js) 全局
- logic*.js 逻辑层
    - [logic_cmd.js](https://github.com/lolBig/ball/blob/master/cli/logic_cmd.js) 逻辑帧
    - [logic_controll.js](https://github.com/lolBig/ball/blob/master/cli/logic_controll.js) 用户输入
    - [logic_entity.js](https://github.com/lolBig/ball/blob/master/cli/logic_entity.js) 实体
    - [logic_map.js](https://github.com/lolBig/ball/blob/master/cli/logic_map.js) 地图
    - [logic_player.js](https://github.com/lolBig/ball/blob/master/cli/logic_player.js) 玩家
    - logic_state*.js 实体状态
        - [logic_state_eat.js](https://github.com/lolBig/ball/blob/master/cli/logic_state_eat.js) 吃
        - [logic_state_move.js](https://github.com/lolBig/ball/blob/master/cli/logic_state_move.js) 移动
        - [logic_state_split.js](https://github.com/lolBig/ball/blob/master/cli/logic_state_split.js) 破坏
- [main.js](https://github.com/lolBig/ball/blob/master/cli/main.js) 入口
- manager*.js 控制层
    - [manager_game.js](https://github.com/lolBig/ball/blob/master/cli/manager_game.js)游戏
    - [manager_login.js](https://github.com/lolBig/ball/blob/master/cli/manager_login.js) 登录
    - [manager_net.js](https://github.com/lolBig/ball/blob/master/cli/manager_net.js) 网络
    - [manager_world.js](https://github.com/lolBig/ball/blob/master/cli/manager_world.js) 大厅
- render*.js 渲染层
    - renderer_dialog*.js 弹窗
        - [renderer_dialog_notice.js](https://github.com/lolBig/ball/blob/master/cli/renderer_dialog_notice.jsx) 确认
        - [renderer_dialog_select.js](https://github.com/lolBig/ball/blob/master/cli/renderer_dialog_select.jsx) 选择
        - [renderer_game_dialog_end.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game_dialog_end.jsx) 游戏结束
        - [renderer_game_dialog_settlement.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game_dialog_settlement.jsx) 游戏结算
        - [renderer_game_dialog_setting.js](https://github.com/lolBig/ball/blob/master/cli/renderer_dialog_setting.jsx) 游戏设置
        - [renderer_login_dialog_enter.js](https://github.com/lolBig/ball/blob/master/cli/renderer_login_dialog_enter.jsx) 登录
        - [renderer_world_dialog_start.js](https://github.com/lolBig/ball/blob/master/cli/renderer_world_dialog_start.jsx) 大厅路由
    - [renderer_entity.js](https://github.com/lolBig/ball/blob/master/cli/renderer_entity.jsx) 实体
    - [renderer_game_rankboard.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game_rankboard.jsx) 游戏实时排名
    - [renderer_game_timer.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game_timer.jsx) 游戏倒计时
    - [renderer_game_ui.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game_ui.jsx) 游戏ui
    - [renderer_game.js](https://github.com/lolBig/ball/blob/master/cli/renderer_game.jsx) 游戏场景
    - [renderer_keyboard.js](https://github.com/lolBig/ball/blob/master/cli/renderer_keyboard.jsx) 移动设备上的虚拟摇杆
    - [renderer_map.js](https://github.com/lolBig/ball/blob/master/cli/renderer_map.jsx) 地图
    - renderer_widget*.js 控件
        - [renderer_widget_switch.js](https://github.com/lolBig/ball/blob/master/cli/renderer_widget_switch.jsx) 切换页
    - [renderer_world_chat.js](https://github.com/lolBig/ball/blob/master/cli/renderer_world_chat.jsx) 聊天
    - [renderer_world.js](https://github.com/lolBig/ball/blob/master/cli/renderer_world.jsx) 大厅
- res*.js 配置表
    - [res_action.js](https://github.com/lolBig/ball/blob/master/cli/res_action.js) 玩家指令
    - [res_common.js](https://github.com/lolBig/ball/blob/master/cli/res_common.js) 通用
    - [res_entities.js](https://github.com/lolBig/ball/blob/master/cli/res_entities.js) 实体
    - [res_error_code.js](https://github.com/lolBig/ball/blob/master/cli/res_error_code.js) 错误代码
    - [res_icon_font.js](https://github.com/lolBig/ball/blob/master/cli/res_icon_font.js) SVG Symbol
    - [res_lan.js](https://github.com/lolBig/ball/blob/master/cli/res_lan.js) 语言
    - [res_protocol.js](https://github.com/lolBig/ball/blob/master/cli/res_protocol.js) 协议
    - res_svr*.js 从svr拷贝过来的配置表
- [scheduler.js](https://github.com/lolBig/ball/blob/master/cli/scheduler.js) 计时器
- [style_main.less](https://github.com/lolBig/ball/blob/master/cli/style_main.less) 主样式
- [style_static.less](https://github.com/lolBig/ball/blob/master/cli/style_static.less) Base64后的资源
- [template.html](https://github.com/lolBig/ball/blob/master/cli/template.html) 模板文件
- [util.js](https://github.com/lolBig/ball/blob/master/cli/util.js) 工具
- [webpack.cfg.dev.js](https://github.com/lolBig/ball/blob/master/cli/webpack.cfg.dev.js) 开发构建
- [webpack.cfg.dist.js](https://github.com/lolBig/ball/blob/master/cli/webpack.cfg.dist.js) 生产构建
- [webpack.plugin.res.js](https://github.com/lolBig/ball/blob/master/cli/webpack.plugin.res.js) 从svr拷贝配置表的webpack插件

# 服务端结构
- agent*.js 代理
    - [agent_game.js](https://github.com/lolBig/ball/blob/master/svr/agent_game.js) 游戏
    - [agent_static.js](https://github.com/lolBig/ball/blob/master/svr/agent_static.js) 资源
    - [agent_world.js](https://github.com/lolBig/ball/blob/master/svr/agent_world.js) 大厅
- [app.js](https://github.com/lolBig/ball/blob/master/svr/app.js) 入口
- [deploy.js](https://github.com/lolBig/ball/blob/master/svr/deploy.js) 部署
- [deploy.js](https://github.com/lolBig/ball/blob/master/svr/deploy.json)on pm2部署
- [logger.js](https://github.com/lolBig/ball/blob/master/svr/logger.js) 日志
- logic*.js 逻辑
    - [logic_room.js](https://github.com/lolBig/ball/blob/master/svr/logic_room.js) 游戏房间
    - [logic_player.js](https://github.com/lolBig/ball/blob/master/svr/logic_player.js) 玩家
- [message.js](https://github.com/lolBig/ball/blob/master/svr/message.js) 协议
- res*.js 配置表
    - [res_common.js](https://github.com/lolBig/ball/blob/master/svr/res_common.js) 通用
    - [res_error_code.js](https://github.com/lolBig/ball/blob/master/svr/res_error_code.js) 错误码
    - [res_protocol.js](https://github.com/lolBig/ball/blob/master/svr/res_protocol.js) 协议
- server*.js 服务器
    - [server_chat.js](https://github.com/lolBig/ball/blob/master/svr/server_chat.js) 聊天
    - [server_game.js](https://github.com/lolBig/ball/blob/master/svr/server_game.js) 游戏
    - [server_world.js](https://github.com/lolBig/ball/blob/master/svr/server_world.js) 大厅
- [token.js](https://github.com/lolBig/ball/blob/master/svr/token.js) token
- [util.js](https://github.com/lolBig/ball/blob/master/svr/util.js) 工具
