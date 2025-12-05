# 宠物网项目 - 清理并启动脚本
# 自动清理端口占用并启动前后端服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  宠物网项目 - 一键启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 清理端口占用
Write-Host "[1/4] 检查并清理端口占用..." -ForegroundColor Yellow

$ports = @(3001, 5173)
$cleanedProcesses = @()

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process -and $process.ProcessName -eq 'node') {
                    Write-Host "  停止占用端口 $port 的进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Gray
                    Stop-Process -Id $pid -Force
                    $cleanedProcesses += $pid
                }
            } catch {
                Write-Host "  无法停止进程 $pid" -ForegroundColor Red
            }
        }
    }
}

if ($cleanedProcesses.Count -gt 0) {
    Write-Host "  已清理 $($cleanedProcesses.Count) 个进程" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "  端口正常，无需清理" -ForegroundColor Green
}

Write-Host ""

# 2. 启动后端服务
Write-Host "[2/4] 启动后端服务..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"

if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '后端服务启动中...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Write-Host "  后端服务已在新窗口启动" -ForegroundColor Green
} else {
    Write-Host "  错误: 找不到 backend 目录" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3
Write-Host ""

# 3. 启动前端服务
Write-Host "[3/4] 启动前端服务..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (Test-Path $frontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '前端服务启动中...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
    Write-Host "  前端服务已在新窗口启动" -ForegroundColor Green
} else {
    Write-Host "  错误: 找不到 frontend 目录" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3
Write-Host ""

# 4. 完成
Write-Host "[4/4] 启动完成!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  服务访问地址:" -ForegroundColor Cyan
Write-Host "  - 前端: http://localhost:5173" -ForegroundColor White
Write-Host "  - 后端API: http://localhost:3001/api" -ForegroundColor White
Write-Host "  - 管理后台: http://localhost:5173/admin/login" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 按任意键退出此窗口..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
