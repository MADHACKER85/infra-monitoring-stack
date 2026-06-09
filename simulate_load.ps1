# PowerShell script to simulate CPU load for monitoring demonstration

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     Infrastructure Metric Load Simulator    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "This script simulates CPU load to trigger alerts in Prometheus/Grafana."
Write-Host "Since Node Exporter runs in a container, container-based stress is recommended."
Write-Host ""

function Show-Menu {
    Write-Host "Please select a load simulation option:" -ForegroundColor Yellow
    Write-Host "1) Start Container-based CPU Stress (Recommended - clean & runs inside Docker)"
    Write-Host "2) Start Windows Host CPU Stress (Runs native PowerShell jobs on physical machine)"
    Write-Host "3) Stop all CPU Stress tasks"
    Write-Host "4) Exit"
    Write-Host ""
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        "1" {
            Write-Host "Starting container-based CPU stress..." -ForegroundColor Green
            # Run 2 background containers performing infinite loops to consume CPU
            docker run -d --name cpu-stress-1 alpine sh -c "while true; do :; done" > $null
            docker run -d --name cpu-stress-2 alpine sh -c "while true; do :; done" > $null
            Write-Host "Containers 'cpu-stress-1' and 'cpu-stress-2' are running." -ForegroundColor Green
            Write-Host "Check your Grafana dashboard. CPU metrics should begin climbing rapidly." -ForegroundColor Green
            Write-Host ""
        }
        "2" {
            Write-Host "Starting Windows Host CPU stress..." -ForegroundColor Green
            $cores = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
            Write-Host "Detected $cores logical processors. Starting background jobs..." -ForegroundColor Yellow
            
            # Start jobs consuming logical cores
            for ($i = 0; $i -lt ($cores - 1); $i++) {
                Start-Job -ScriptBlock {
                    $val = 0
                    while ($true) { $val = $val + 1 }
                } > $null
            }
            Write-Host "PowerShell background jobs started." -ForegroundColor Green
            Write-Host "Check Task Manager or Grafana. Host CPU should begin spiking." -ForegroundColor Green
            Write-Host ""
        }
        "3" {
            Write-Host "Stopping all stress tasks..." -ForegroundColor Red
            
            # Stop containers
            Write-Host "Stopping stress containers..." -ForegroundColor Yellow
            docker rm -f cpu-stress-1 cpu-stress-2 2>&1 > $null
            
            # Stop local jobs
            Write-Host "Stopping PowerShell background jobs..." -ForegroundColor Yellow
            Get-Job | Stop-Job
            Get-Job | Remove-Job
            
            Write-Host "All load simulations stopped. Resource usage will normalize shortly." -ForegroundColor Green
            Write-Host ""
        }
        "4" {
            Write-Host "Exiting. Note: Run option '3' first if you have active simulations." -ForegroundColor Cyan
            break
        }
        default {
            Write-Host "Invalid choice. Please select 1, 2, 3, or 4." -ForegroundColor Red
            Write-Host ""
        }
    }
}
