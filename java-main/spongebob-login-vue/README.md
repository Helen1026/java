# 比奇堡登录（海绵宝宝主题）· Vue 3 + Vite

由原 `spongebob-login.html` 单文件页面拆分而成的 Vue 项目，页面风格保持不变，含登录 / 注册双页面。

## 目录结构

```
spongebob-login-vue/
├── index.html              # 入口 HTML
├── vite.config.js          # Vite 配置
├── package.json
└── src/
    ├── main.js             # 应用入口（挂载路由）
    ├── App.vue             # 根组件：背景装饰 + router-view（含切换动画）
    ├── router/
    │   └── index.js        # 路由：/login、/register
    ├── userProfile.js      # 用户资料 store（昵称 / 头像 / 签名，全站实时同步）
    ├── points.js           # 积分系统 store：每日任务 / 积分流水 / 头像框（localStorage）
    ├── cart.js             # 购物车 store（导航栏购物车面板共用）
    ├── api/
    │   ├── request.js      # axios 实例：baseURL、token 拦截、统一错误处理
    │   └── auth.js         # 登录 / 注册 / 验证码接口（支持 mock 开关）
    ├── assets/
    │   └── main.css        # 全局样式 + 圆角规范 token + 登录/注册卡片共享样式
    ├── components/
    │   ├── BubbleField.vue      # 背景气泡：缓慢上浮 + 摆动，低透明度
    │   ├── SeaDecor.vue         # 海底装饰：沙滩、海草、花朵云
    │   ├── LoginCard.vue        # 登录卡片：海绵宝宝头像、表单、校验
    │   ├── RegisterCard.vue     # 注册卡片：派大星头像、密码规则、验证码
    │   ├── GraphicCaptcha.vue   # 画布图形验证码（本地占位，可换后端方案）
    │   ├── HomeView.vue         # 首页：搜索栏 + 导航栏 + 分级分类 + 后台入口
    │   ├── AdminLogin.vue       # 后台登录：仅登录（无注册）
    │   ├── AdminDashboard.vue   # 后台管理：条目 + 分类 CRUD（侧边栏 + 表格 + 弹窗）
    │   ├── PageShell.vue        # 子页面外壳：导航栏 / 标题区 / 页脚 / 轻提示
    │   ├── SeaFooter.vue        # 全站页脚：版权 / 关于比奇堡 / 联系管理员 / 小标语
    │   ├── UserAvatar.vue       # 头像：支持 emoji / 本地图片 / 6 款头像框
    │   ├── PointsChip.vue       # 导航栏积分胶囊：余额 + 今日任务进度点
    │   ├── DailyTasks.vue       # 每日任务面板：登录 / 下单 / 捕水母进度 + 积分流水
    │   ├── FrameShop.vue        # 头像框商店：积分兑换 / 佩戴
    │   ├── JellyfishField.vue   # 水母田：图鉴 + 捕捞 + 鱼篓
    │   ├── KrustyKrab.vue       # 蟹堡王：菜单 + 购物车 + 结账
    │   ├── PineappleHouse.vue   # 菠萝屋：个人中心 / 收藏 / 资料设置
    │   └── AboutBikiniBottom.vue# 关于比奇堡：小镇简介 / 地标 / 编年史
```

## 运行

```bash
npm install
npm run dev
```

浏览器打开 http://192.168.68.25:5173 ，自动跳转到 `/login`（本机自测也可以用 http://localhost:5173 ）。

## 构建

```bash
npm run build
```

## 路由

| 路径          | 页面       | 说明                                   |
| ------------- | ---------- | -------------------------------------- |
| `/`           | 重定向     | 跳转到 `/login`                        |
| `/login`      | 登录页     | LoginCard                              |
| `/register`   | 注册页     | RegisterCard                           |
| `/home`       | 首页       | 搜索栏 + 导航栏 + 分级分类筛选         |
| `/jellyfish`  | 水母田     | 水母图鉴、捕捞、鱼篓                   |
| `/krusty-krab`| 蟹堡王     | 菜单、购物车、结账（本地演示价）       |
| `/pineapple`  | 菠萝屋     | 个人中心、收藏、资料设置               |
| `/about`      | 关于比奇堡 | 小镇简介、地标、编年史                 |
| `/admin/login`| 后台登录   | AdminLogin：仅登录（无注册）          |
| `/admin`      | 后台管理   | AdminDashboard：条目 + 分类数据管理    |

> 首页导航栏右侧「🔐 后台管理」按钮直达 `/admin`（未登录自动跳后台登录页）。
> 后台管理需携带有效 JWT（受后端 `CorsConfig` 的 `/api/admin/**` 拦截器保护），
> 默认账号见后端说明（演示账号 spongebob / 12345678a）。

> 除首页外的 4 个子页面共用 `PageShell.vue`，其导航栏 / 标题区 / 页脚 / 轻提示样式统一放在
> `src/assets/main.css` 的「子页面共享样式」区块中，新增页面时直接复用即可。

## 注册页校验规则

- 密码：长度 **8-20 位**、必须同时包含**字母和数字**、**不含空格**（输入时实时提示）
- 确认密码：需与密码一致
- 验证码：4 位图形验证码，不区分大小写，点击图片可刷新

## 后端对接

接口层已封装好（`src/api/`），后端未就绪前所有接口走本地模拟（mock），页面可独立开发。

后端已就绪（springBootTest，端口 8081，本机 IP 192.168.68.25），`.env.development` 当前配置：

```
VITE_BACKEND_ORIGIN=http://192.168.68.25:8081   # Vite 代理目标（后端地址）
VITE_API_BASE_URL=/api                          # axios baseURL，走上面的代理
VITE_USE_MOCK=false
```

> 换网络 / 换 IP 时只改 `VITE_BACKEND_ORIGIN` 一处；只想本机自测可临时改成 `http://127.0.0.1:8081`。
> 后端 `server.address=0.0.0.0`，所以后端本身就同时监听 192.168.68.25:8081 和 localhost:8081。

后端未启动时可把 `VITE_USE_MOCK` 改回 `true`，接口走本地模拟。

| 接口 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/auth/login`    | POST | 登录，入参 `{ username, password }` |
| `/auth/register` | POST | 注册，入参 `{ username, password, captcha, captchaId }` |
| `/auth/captcha`  | GET  | 图形验证码，返回 `{ captchaId, img }` |

后端验证码方案：用 `getCaptchaApi()` 的返回替换 `GraphicCaptcha.vue` 的本地画布绘制，提交表单时携带 `captchaId`。

## 登录 / 注册逻辑位置

- 登录：`src/components/LoginCard.vue` 的 `handleLogin()`
- 注册：`src/components/RegisterCard.vue` 的 `handleRegister()`
