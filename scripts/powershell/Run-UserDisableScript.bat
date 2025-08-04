@echo off
REM Batch script for running the optimized PowerShell user disable script
REM This script provides different execution scenarios for various dataset sizes

echo ===============================================
echo    Optimized User Disable Script Launcher
echo ===============================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Current directory: %CD%
echo.

:MENU
echo Select execution scenario:
echo.
echo 1. Small dataset (^<1,000 users) - Conservative settings
echo 2. Medium dataset (1,000-10,000 users) - Balanced settings  
echo 3. Large dataset (10,000+ users) - Optimized settings
echo 4. Custom settings - Manual configuration
echo 5. Test mode - Run validation tests only
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto SMALL
if "%choice%"=="2" goto MEDIUM
if "%choice%"=="3" goto LARGE
if "%choice%"=="4" goto CUSTOM
if "%choice%"=="5" goto TEST
if "%choice%"=="6" goto EXIT
echo Invalid choice. Please try again.
goto MENU

:SMALL
echo.
echo === SMALL DATASET CONFIGURATION ===
echo BatchSize: 100
echo MaxThreads: 4
echo Recommended for: Less than 1,000 users
echo.
set /p csvpath="Enter CSV file path: "
if not exist "%csvpath%" (
    echo Error: CSV file not found!
    pause
    goto MENU
)
echo.
echo Starting PowerShell script...
powershell.exe -ExecutionPolicy Bypass -File "DisableUser_Optimized_Parallel.ps1" -CsvPath "%csvpath%" -BatchSize 100 -MaxThreads 4
goto COMPLETE

:MEDIUM
echo.
echo === MEDIUM DATASET CONFIGURATION ===
echo BatchSize: 250
echo MaxThreads: 8
echo Recommended for: 1,000-10,000 users
echo.
set /p csvpath="Enter CSV file path: "
if not exist "%csvpath%" (
    echo Error: CSV file not found!
    pause
    goto MENU
)
echo.
echo Starting PowerShell script...
powershell.exe -ExecutionPolicy Bypass -File "DisableUser_Optimized_Parallel.ps1" -CsvPath "%csvpath%" -BatchSize 250 -MaxThreads 8
goto COMPLETE

:LARGE
echo.
echo === LARGE DATASET CONFIGURATION ===
echo BatchSize: 500
echo MaxThreads: 12
echo Recommended for: 10,000+ users (like your 63,651 user dataset)
echo.
set /p csvpath="Enter CSV file path: "
if not exist "%csvpath%" (
    echo Error: CSV file not found!
    pause
    goto MENU
)
echo.
echo Starting PowerShell script...
powershell.exe -ExecutionPolicy Bypass -File "DisableUser_Optimized_Parallel.ps1" -CsvPath "%csvpath%" -BatchSize 500 -MaxThreads 12
goto COMPLETE

:CUSTOM
echo.
echo === CUSTOM CONFIGURATION ===
set /p csvpath="Enter CSV file path: "
if not exist "%csvpath%" (
    echo Error: CSV file not found!
    pause
    goto MENU
)
set /p batchsize="Enter batch size (50-500): "
set /p maxthreads="Enter max threads (4-16): "
set /p outputdir="Enter output directory (optional, press Enter for default): "

echo.
echo Starting PowerShell script with custom settings...
if "%outputdir%"=="" (
    powershell.exe -ExecutionPolicy Bypass -File "DisableUser_Optimized_Parallel.ps1" -CsvPath "%csvpath%" -BatchSize %batchsize% -MaxThreads %maxthreads%
) else (
    powershell.exe -ExecutionPolicy Bypass -File "DisableUser_Optimized_Parallel.ps1" -CsvPath "%csvpath%" -BatchSize %batchsize% -MaxThreads %maxthreads% -OutputDirectory "%outputdir%"
)
goto COMPLETE

:TEST
echo.
echo === RUNNING VALIDATION TESTS ===
echo This will test the script functionality without making actual changes.
echo.
powershell.exe -ExecutionPolicy Bypass -File "Test-DisableUserScript.ps1"
echo.
echo Test completed. Check the output above for results.
pause
goto MENU

:COMPLETE
echo.
echo ===============================================
echo           Process Completed
echo ===============================================
echo.
echo Check the output directory for results:
echo - Detailed CSV report with individual user status
echo - Summary text report with performance metrics
echo.
pause
goto MENU

:EXIT
echo.
echo Goodbye!
pause
exit /b 0