@echo off
chcp 936 >nul
title 比奇堡登录系统 - 停止
echo 正在停止前后端服务...
echo.

call :killport 8081 后端
call :killport 5173 前端
call :killport 35729 LiveReload热重载

echo.
echo 已全部停止。MySQL 服务保持运行，如需停止请手动执行 net stop MySQL80
if /i not "%~1"=="nopause" pause
exit /b 0

:killport
set "port=%~1"
set "name=%~2"
set "found=0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:":%port% " ^| findstr /C:"LISTENING"') do (
    set "found=1"
    echo [停止] %name% 端口 %port%，PID %%p
    taskkill /F /T /PID %%p >nul 2>nul
)
if "%found%"=="0" echo [跳过] %name% 端口 %port% 未在运行
goto :eof
