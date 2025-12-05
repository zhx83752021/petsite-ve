# 开发环境启动脚本 - 自动处理端口占用问题

$PORT = 3001
$PROCESS_NAME = "node"

Write-Host "正在检查端口 $PORT..." -ForegroundColor Cyan

# 查找占用端口的进程
$processes = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "发现端口 $PORT 被占用，正在停止相关进程..." -ForegroundColor Yellow

    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "停止进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force
                Start-Sleep -Milliseconds 500
            }
        } catch {
            Write-Host "无法停止进程 $pid" -ForegroundColor Red
        }
    }

    Write-Host "端口已清理" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# 启动开发服务器
Write-Host "启动开发服务器..." -ForegroundColor Cyan
Set-Location $PSScriptRoot\..
npm run dev
