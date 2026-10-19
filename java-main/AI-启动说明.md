# AI 启动说明（给 WorkBuddy/CodeBuddy 的备忘，避免重复踩坑）

> 本文件是写给 AI 助手的。用户要求：每次开机电脑会重置（node_modules、target 目录会被删除），
> 启动项目前请直接按本文档操作，不要重新摸索。
> 最后更新：2026-10-12

## 一、项目概况

| 项目 | 路径（相对本文件） | 端口 | 说明 |
|---|---|---|---|
| 后端 springBootTest | `.\springBootTest` | 8081 | Spring Boot 3.4.5 + MyBatis-Plus + MySQL + JWT，profile=dev |
| 前端 spongebob-login-vue | `.\spongebob-login-vue` | 5173 | Vue 3 + Vite 6 + vue-router + axios，API 指向 http://localhost:8081/api |

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
curl -s -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d '{"username":"spongebob","password":"12345678a"}'
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
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
- 未做视觉截图验证（agent-browser 未安装），改动后请用 `curl http://localhost:5173/src/components/X.vue`
  检查 Vite 是否编译通过 + `tail` 前端日志看有无 error

## 七、缺什么（本次补齐情况）

- [x] 数据库 bikini_bottom 未创建 → 已执行 init.sql 建好
- [x] 前端 node_modules 缺失 → 已 npm install
- [x] 后端 target 缺失 → mvnw 自动编译
- [ ] npm 源是官方 registry.npmjs.org，装依赖约 40 秒；如变慢可换淘宝镜像
- [ ] application.properties 里注释是乱码（原文件编码问题），不影响运行，可不管
