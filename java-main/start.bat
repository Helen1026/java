@echo off
chcp 936 >nul
title 比奇堡登录系统 - 一键启动
cd /d "%~dp0"

echo ================================================
echo   比奇堡登录系统 一键启动
echo   前端: spongebob-login-vue  (端口 5173)
echo   后端: springBootTest       (端口 8081)
echo ================================================
echo.

rem ---- 0. 清除 WorkBuddy 环境注入的端口变量，防止覆盖配置里的 8081 ----
set "SERVER__PORT="
set "SERVER_PORT="
if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Zulu\zulu-21"

rem ---- 1. 环境检查 ----
where java >nul 2>nul || (echo [错误] 未找到 java 命令 & goto :fail)
where npm  >nul 2>nul || (echo [错误] 未找到 npm 命令  & goto :fail)

rem ---- 2. MySQL 检查(3306)，未运行则尝试启动 MySQL80 服务 ----
netstat -ano | findstr /C:":3306 " | findstr /C:"LISTENING" >nul
if errorlevel 1 (
    echo [提示] MySQL 未运行，尝试启动服务 MySQL80 ...
    net start MySQL80 >nul 2>nul
    timeout /t 3 /nobreak >nul
)
netstat -ano | findstr /C:":3306 " | findstr /C:"LISTENING" >nul
if errorlevel 1 echo [警告] MySQL 仍未运行，后端连数据库会失败！

rem ---- 3. 数据库初始化（bikini_bottom 不存在时自动执行 init.sql）----
set "MYSQL_CMD="
where mysql >nul 2>nul && set "MYSQL_CMD=mysql"
if not defined MYSQL_CMD if exist "%ProgramFiles%\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_CMD=%ProgramFiles%\MySQL\MySQL Server 8.0\bin\mysql.exe"
if defined MYSQL_CMD (
    "%MYSQL_CMD%" -u root -p123456 -e "use bikini_bottom;" >nul 2>nul
    if errorlevel 1 (
        echo [提示] 数据库 bikini_bottom 不存在，正在执行 init.sql ...
        "%MYSQL_CMD%" -u root -p123456 --default-character-set=utf8mb4 < "springBootTest\sql\init.sql" >nul 2>nul
        echo [OK] 数据库 bikini_bottom 初始化完成（演示账号 spongebob / 12345678a）
    ) else (
        echo [OK] 数据库 bikini_bottom 已就绪
    )
) else (
    echo [警告] 未找到 mysql 客户端，跳过数据库检查
)

rem ---- 4. 启动后端（新窗口，mvnw 会自动编译并下载缺失依赖）----
echo [启动] 后端 springBootTest（首次编译约 30 秒，请等窗口出现 Tomcat started）...
cd /d "%~dp0springBootTest"
start "后端-8081" cmd /k mvnw.cmd -Dspring-boot.run.arguments=--server.port=8081 spring-boot:run

rem ---- 5. 启动前端（新窗口，自动 npm install 再 npm run dev）----
echo [启动] 前端 spongebob-login-vue（node_modules 被删时会自动重装，约 1 分钟）...
cd /d "%~dp0spongebob-login-vue"
start "前端-5173" cmd /k "npm install --no-audit --no-fund && npm run dev"

echo.
echo ================================================
echo   全部启动命令已发出！
echo   前端页面: http://localhost:5173
echo   后端接口: http://localhost:8081
echo   测试账号: spongebob / 12345678a
echo   停止项目: 双击 stop.bat
echo ================================================
if /i not "%~1"=="nopause" pause
exit /b 0

:fail
echo 启动失败，请检查环境后重试。
if /i not "%~1"=="nopause" pause
exit /b 1
