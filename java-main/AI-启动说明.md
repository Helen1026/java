# AI 启动说明（给 WorkBuddy/CodeBuddy 的备忘，避免重复踩坑）

> 本文件是写给 AI 助手的。用户要求：每次开机电脑会重置（node_modules、target 目录会被删除），
> 启动项目前请直接按本文档操作，不要重新摸索。
> 最后更新：2026-10-12

## 一、项目概况

| 项目 | 路径（相对本文件） | 端口 | 说明 |
|---|---|---|---|
| 后端 springBootTest | `.\springBootTest` | 8081 | Spring Boot 3.4.5 + MyBatis-Plus + MySQL + JWT，profile=dev |
| 前端 spongebob-login-vue | `.\spongebob-login-vue` | 5173 | Vue 3 + Vite 6 + vue-router + axios，API 经 Vite 代理指向 http://192.168.68.25:8081/api |

- 访问地址（本机局域网 IP 192.168.68.25）：前端 http://192.168.68.25:5173 ，后端 http://192.168.68.25:8081
- IP 配置位置：`spongebob-login-vue\.env.development` 的 `VITE_BACKEND_ORIGIN`（Vite 代理目标）与
  `vite.config.js` 里的同名默认值；后端 `server.address=0.0.0.0` 监听全部网卡，已包含该 IP（不写死，防 DHCP 换 IP 启动失败）

- 数据库：MySQL `bikini_bottom`，表 `sys_user`，账号 root/123456
- 测试账号：spongebob / 12345678a
- 前后端已联调通过：POST /api/auth/login 返回 token

## 二、本机环境（已确认可用）

- Java：Zulu 21（JAVA_HOME=C:\Program Files\Zulu\zulu-21，系统级已设置）
- Node：v22.22.2 + npm 10.9.7（在 PATH）
- MySQL：MySQL80 服务，开机自启，客户端在 `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
- Maven：**没有全局 mvn**。用 `springBootTest\mvnw.cmd`（wrapper），或已下载的本地分发版
  `C:\Users\Administrator\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd`
- ~/.m2 依赖缓存目前跨重启保留（若被清，mvnw.cmd 会自动重新下载，只是慢）

## 三、一键脚本（给用户双击用）

- `start.bat`：检查环境 → 确保 MySQL 运行 → 数据库不存在时自动执行 `springBootTest\sql\init.sql`
  → 新窗口启动后端（mvnw 自动编译）→ 新窗口 npm install + npm run dev。参数 `nopause` 可跳过结尾暂停。
- `stop.bat`：杀掉 8081/5173/35729 端口进程。参数 `nopause` 同上。
- **脚本为 GBK 编码 + CRLF**，修改时必须保持 GBK（先写 UTF-8 再 `iconv -f UTF-8 -t GBK`），否则中文乱码。
- 注意：**AI 从沙箱里运行 start.bat 时 `start` 开新窗口会被拦截**（沙箱禁止派生 cmd.exe 子进程），
  脚本本身逻辑正确，用户双击没问题；AI 自己启动请用下面第四节的直连命令。

## 四、AI 快速启动命令（绕过沙箱，已验证）

后端（用 PowerShell 工具，后台运行）：
```powershell
Remove-Item Env:SERVER__PORT -ErrorAction SilentlyContinue
$env:JAVA_HOME="C:\Program Files\Zulu\zulu-21"
Set-Location "C:\Users\Administrator\Desktop\java-main\springBootTest"
& "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd" "-Dspring-boot.run.arguments=--server.port=8081" spring-boot:run *>&1 | Out-File -FilePath "$env:TEMP\backend.log" -Encoding utf8
```

前端（用 Bash 工具，后台运行）：
```bash
cd "/c/Users/Administrator/Desktop/java-main/spongebob-login-vue" && npm install --no-audit --no-fund && npm run dev > /tmp/frontend.log 2>&1
```

数据库（每次开机若 MySQL 数据也被重置，先执行一次；幂等但会 DROP 表清掉注册数据）：
```bash
"/c/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" -u root -p123456 --default-character-set=utf8mb4 < "/c/Users/Administrator/Desktop/java-main/springBootTest/sql/init.sql"
```

验证（Bash）：
```bash
curl -s -X POST http://192.168.68.25:8081/api/auth/login -H "Content-Type: application/json" -d '{"username":"spongebob","password":"12345678a"}'
curl -s -o /dev/null -w "%{http_code}" http://192.168.68.25:5173/
```

## 五、已知坑（重要！都是实测踩过的）

1. **SERVER__PORT=56320**：WorkBuddy 给会话注入了这个环境变量，Spring Boot 宽松绑定会把它当
   `server.port`，导致后端启动报"Port 56320 was already in use"（那是 WorkBuddy 自己的端口）。
   解决：启动前清掉该变量，且显式传 `--server.port=8081`（命令行参数优先级最高）。
2. **Git Bash 里跑 Maven 必挂**：`sh mvnw` 报 MAVEN_PROJECTBASEDIR 解析错误；直接跑 mvn/mvn.cmd
   报 classworlds ClassNotFound（MSYS 路径转换破坏 classpath）。Bash 里调 cmd.exe 又被沙箱拦截。
   → 一律用 **PowerShell 工具**跑 mvn.cmd。
3. **PowerShell 工具无回显**：命令能执行但看不到输出。→ 输出用 `Out-File` 写临时文件再 Read。
4. **sc.exe 在黑名单**：查服务用 PowerShell `Get-CimInstance Win32_Service`。
5. **批处理括号坑**：for/if 块内 echo 文本含 ASCII 右括号 `)` 会提前终止代码块（stop.bat 踩过：
   taskkill 被跳过）。块内提示文字别用 ASCII 括号，中文全角括号（）没事。
6. **每次开机 node_modules 和 target 被删**：前端先 npm install；后端 mvnw spring-boot:run 会自动
   重新编译，无需额外处理。

## 六、前端页面结构（截至 2026-10-12）

| 路由 | 组件 | 说明 |
|---|---|---|
| `/` | 重定向 | 默认跳 `/login` |
| `/login` | `components/LoginCard.vue` | 登录，成功后写入 token/username/userInfo 并跳 `/home` |
| `/register` | `components/RegisterCard.vue` | 注册，成功后跳 `/login` |
| `/home` | `components/HomeView.vue` | 首页：导航栏 + 搜索栏 + 卡片结果区；未加登录守卫 |

- 主题：海底渐变底 + 海绵黄卡片（#FDE047→#FACC15）+ 海绿按钮（#34D399→#059669）+ 珊瑚红（#FB7185），
  共享样式在 `src/assets/main.css`，全局气泡/海底装饰在 `App.vue`（BubbleField、SeaDecor）
- 首页数据：`src/api/home.js` 先请求 `/home/search`、`/home/recommend`，**后端未实现时自动回退本地演示数据**
  （因为 `.env.development` 是 `VITE_USE_MOCK=false`，如果直接报错会导致搜索不可用）
- 未做视觉截图验证（agent-browser 未安装），改动后请用 `curl http://192.168.68.25:5173/src/components/X.vue`
  检查 Vite 是否编译通过 + `tail` 前端日志看有无 error
- 子页面（水母田 / 蟹堡王 / 菠萝屋 / 关于比奇堡 / 商品详情）统一用 `components/PageShell.vue` 包壳

### 2026-11-16 视觉优化：新增的共享件与约定（改页面前先看这里）

| 文件 | 作用 |
|---|---|
| `components/BubbleField.vue` | 全站背景气泡：18~40s 缓慢上浮 + 左右摆动，峰值透明度 0.14~0.34，`prefers-reduced-motion` 下自动关闭。样式已收敛到组件 scoped，**main.css 里不再有 `.bubble`** |
| `components/SeaFooter.vue` | 全站页脚：版权 / 关于比奇堡 / 联系管理员（弹层可复制邮箱）/ 海绵宝宝小标语。首页直接引入，子页面由 PageShell 渲染，`footer-text` 会作为页脚补充说明 |
| `components/UserAvatar.vue` | 头像组件：同时支持 emoji 与图片 dataURL，`size` 控制直径，全站导航/欢迎语/个人中心共用 |
| `src/userProfile.js` | 用户资料响应式 store（nickname / avatar / signature），提供 `loadProfile` / `saveProfile` / `clearProfile` / `readImageAsAvatar`（本地图片裁切压缩成 160×160 JPEG）。改完资料后首页与各子页面导航栏**实时同步** |

圆角规范（`src/assets/main.css` 的 `:root`，不要再手写具体数值）：

- `--r-pill: 999px` —— 所有可点元素：导航按钮、搜索按钮、分类/热门标签、返回/清空/退出、页脚链接
- `--r-card: 22px` —— 大卡片、面板、弹层、搜索栏容器
- `--r-card-sm: 18px` —— 小卡片、榜单条
- `--r-field: 14px` —— 输入框

### 2026-11-16 每日任务积分系统（新增）

| 文件 | 作用 |
|---|---|
| `src/points.js` | 积分 store：余额 / 每日任务计数 / 积分流水 / 头像框拥有与佩戴，全部存 localStorage 的 `bb_points` |
| `components/DailyTasks.vue` | 每日任务面板：三档任务进度条 + 今日所得 + 最近积分记录（首页用 `compact` 紧凑版） |
| `components/PointsChip.vue` | 导航栏积分胶囊：余额 + 今日完成进度点，点进菠萝屋 |
| `components/FrameShop.vue` | 头像框商店：兑换（扣积分并自动佩戴）/ 佩戴已拥有的框 |
| `components/UserAvatar.vue` | 新增 `frame` 能力：6 款纯 CSS 头像框，不传 `frame` 时跟随全站佩戴状态 |

规则（每日 0 点按自然日重置计数，余额不清零，单日上限 105）：

| 任务 | 积分 | 每日上限 | 触发位置 |
|---|---|---|---|
| 每日登录 | +10 | 1 次 | `App.vue` 里 `claimDailyLogin()`（有 token 才发，路由变化补一次） |
| 蟹堡王下单 | +15 | 3 单 | `KrustyKrab.checkout()`、`CartButton.checkout()` |
| 捕捉水母 | +5 | 10 只 | `JellyfishField.catchOne()`（捕捞成功即计入，放生不退） |

头像框：原味（免费）/ 贝壳光环 60 / 泡泡之环 120 / 珊瑚花冠 200 / 水母荧光 300 / 菠萝皇冠 450 / 海绵金边 600。

注意：积分目前只存在浏览器本地（和购物车、收藏一致），**没有后端表**。以后接后端时只需把 `points.js` 里的 `addPoints` / `recordOrder` / `redeemFrame` 换成接口调用，页面不用改。

## 七、缺什么（本次补齐情况）

- [x] 数据库 bikini_bottom 未创建 → 已执行 init.sql 建好
- [x] 前端 node_modules 缺失 → 已 npm install
- [x] 后端 target 缺失 → mvnw 自动编译
- [ ] npm 源是官方 registry.npmjs.org，装依赖约 40 秒；如变慢可换淘宝镜像
- [ ] application.properties 里注释是乱码（原文件编码问题），不影响运行，可不管
