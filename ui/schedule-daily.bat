@echo off
:: Auto-Submit Jurnal Siprakerin - Daily Scheduler Setup
:: Jalankan file ini SEKALI sebagai Administrator untuk mendaftarkan task harian

set "SCRIPT_DIR=%~dp0"
set "NODE_PATH=node"
set "SCRIPT_PATH=%SCRIPT_DIR%auto-submit.js"
set "TASK_NAME=SipraKerinAutoSubmit"
set "LOG_PATH=%SCRIPT_DIR%auto-submit.log"

echo ========================================
echo  Setup Auto-Submit Jurnal Siprakerin
echo ========================================
echo.
echo Script path : %SCRIPT_PATH%
echo Log path    : %LOG_PATH%
echo Jadwal      : Setiap hari jam 07:00
echo.

:: Hapus task lama kalau ada
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Buat task baru — jalankan setiap hari jam 07:00
schtasks /create /tn "%TASK_NAME%" ^
  /tr "cmd /c \"cd /d %SCRIPT_DIR% && node auto-submit.js >> %LOG_PATH% 2>&1\"" ^
  /sc daily ^
  /st 07:00 ^
  /ru "%USERNAME%" ^
  /rl highest ^
  /f

if %errorlevel% == 0 (
    echo.
    echo [OK] Task berhasil didaftarkan!
    echo      Nama task : %TASK_NAME%
    echo      Jadwal    : Setiap hari jam 07:00
    echo      Log       : %LOG_PATH%
    echo.
    echo Untuk cek status task:
    echo   schtasks /query /tn "%TASK_NAME%"
    echo.
    echo Untuk jalankan manual sekarang:
    echo   schtasks /run /tn "%TASK_NAME%"
    echo.
    echo Untuk hapus task:
    echo   schtasks /delete /tn "%TASK_NAME%" /f
) else (
    echo.
    echo [ERROR] Gagal mendaftarkan task.
    echo         Coba jalankan file ini sebagai Administrator.
)

pause
