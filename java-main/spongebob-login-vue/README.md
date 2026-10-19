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
    ├── api/
    │   ├── request.js      # axios 实例：baseURL、token 拦截、统一错误处理
    │   └── auth.js         # 登录 / 注册 / 验证码接口（支持 mock 开关）
    ├── assets/
    │   └── main.css        # 全局样式 + 登录/注册卡片共享样式
    └── components/
        ├── BubbleField.vue # 上升气泡（JS 随机生成）
        ├── SeaDecor.vue    # 海底装饰：沙滩、海草、花朵云
        ├── LoginCard.vue   # 登录卡片：海绵宝宝头像、表单、校验
        ├── RegisterCard.vue# 注册卡片：派大星头像、密码规则、验证码
        └── GraphicCaptcha.vue # 画布图形验证码（本地占位，可换后端方案）
```

## 运行

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 http://localhost:5173），自动跳转到 `/login`。

## 构建

```bash
npm run build
```

## 路由

| 路径        | 页面   |
| ----------- | ------ |
| `/login`    | 登录页 |
| `/register` | 注册页 |

## 注册页校验规则

- 密码：长度 **8-20 位**、必须同时包含**字母和数字**、**不含空格**（输入时实时提示）
- 确认密码：需与密码一致
- 验证码：4 位图形验证码，不区分大小写，点击图片可刷新

## 后端对接

接口层已封装好（`src/api/`），后端未就绪前所有接口走本地模拟（mock），页面可独立开发。

后端已就绪（springBootTest，端口 8081），`.env.development` 当前配置：

```
VITE_API_BASE_URL=http://localhost:8081/api
VITE_USE_MOCK=false
```

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
