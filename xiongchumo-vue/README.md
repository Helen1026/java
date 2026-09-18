# 熊出没 · 登录页（Vue 3 + Vite）

由单文件 HTML 改造而来的 Vue 3 项目，保留原有视觉（森林背景、飘落树叶、熊大熊二 SVG、蜂蜜罐）与交互（账号/密码校验、密码显隐、身份选择、登录提示）。

## 目录结构

```
xiongchumo-vue/
├── index.html              # 入口 HTML
├── package.json            # 依赖与脚本
├── vite.config.js          # Vite 配置
└── src/
    ├── main.js             # 应用入口，挂载 App
    ├── style.css           # 全局样式与 CSS 变量
    ├── App.vue             # 根组件：舞台布局
    └── components/
        ├── ForestBackground.vue  # 飘落树叶 + 树林剪影
        ├── BearScene.vue         # 左侧插画：熊大、熊二、蜂蜜罐
        └── LoginPanel.vue        # 右侧登录表单 + 身份选择 + 提示
```

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173，自动打开浏览器）
npm run dev

# 打包生产版本到 dist/
npm run build

# 预览打包结果
npm run preview
```

## 说明

- 登录逻辑目前为前端演示（校验通过后弹出欢迎提示），如需接入真实后端，替换 `LoginPanel.vue` 中 `onSubmit` 内的逻辑即可。
- 身份（熊熊 / 光头强 / 游客）通过 `role` 状态管理，可对接后端登录接口的角色字段。
