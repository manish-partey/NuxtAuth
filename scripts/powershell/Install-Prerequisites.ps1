#Requires -Version 5.1
<#
.SYNOPSIS
    Installs and configures required PowerShell modules for the user disable script
    
.DESCRIPTION
    This script installs the Microsoft Graph PowerShell modules required for the
    optimized user disable script. It checks for existing installations and
    handles dependencies properly.
    
.PARAMETER Force
    Forces reinstallation of modules even if they already exist
    
.PARAMETER Scope
    Installation scope (CurrentUser or AllUsers). Default is CurrentUser.
    
.EXAMPLE
    .\Install-Prerequisites.ps1
    
.EXAMPLE
    .\Install-Prerequisites.ps1 -Force -Scope AllUsers
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$Force,
    
    [Parameter(Mandatory = $false)]
    [ValidateSet("CurrentUser", "AllUsers")]
    [string]$Scope = "CurrentUser"
)

Write-Host "=== MICROSOFT GRAPH POWERSHELL MODULE INSTALLER ===" -ForegroundColor Magenta
Write-Host "Installing prerequisites for the optimized user disable script..." -ForegroundColor Yellow
Write-Host ""

# Check PowerShell version
$psVersion = $PSVersionTable.PSVersion
Write-Host "PowerShell Version: $($psVersion.ToString())" -ForegroundColor Cyan

if ($psVersion.Major -lt 5) {
    Write-Error "PowerShell 5.1 or higher is required. Current version: $($psVersion.ToString())"
    exit 1
}
Write-Host "✓ PowerShell version check passed" -ForegroundColor Green

# Check execution policy
$executionPolicy = Get-ExecutionPolicy
Write-Host "Current Execution Policy: $executionPolicy" -ForegroundColor Cyan

if ($executionPolicy -eq "Restricted") {
    Write-Warning "Execution Policy is set to Restricted. You may need to change it to run PowerShell scripts."
    Write-Host "Run this command as Administrator to change it:" -ForegroundColor Yellow
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine" -ForegroundColor White
}

# Required modules
$requiredModules = @(
    @{
        Name = "Microsoft.Graph.Authentication"
        Description = "Microsoft Graph Authentication module"
    },
    @{
        Name = "Microsoft.Graph.Users"
        Description = "Microsoft Graph Users management module"
    }
)

Write-Host "`nChecking and installing required modules..." -ForegroundColor Yellow

foreach ($module in $requiredModules) {
    Write-Host "`nProcessing module: $($module.Name)" -ForegroundColor Cyan
    
    try {
        # Check if module is already installed
        $installedModule = Get-Module -ListAvailable -Name $module.Name | Sort-Object Version -Descending | Select-Object -First 1
        
        if ($installedModule -and -not $Force) {
            Write-Host "✓ Module '$($module.Name)' is already installed (Version: $($installedModule.Version))" -ForegroundColor Green
        }
        else {
            if ($installedModule -and $Force) {
                Write-Host "⚠ Module '$($module.Name)' exists but Force parameter specified. Reinstalling..." -ForegroundColor Yellow
            }
            else {
                Write-Host "Installing module '$($module.Name)'..." -ForegroundColor Yellow
            }
            
            # Install the module
            Install-Module -Name $module.Name -Scope $Scope -Force:$Force -AllowClobber -Verbose:$false
            
            # Verify installation
            $newModule = Get-Module -ListAvailable -Name $module.Name | Sort-Object Version -Descending | Select-Object -First 1
            if ($newModule) {
                Write-Host "✓ Module '$($module.Name)' installed successfully (Version: $($newModule.Version))" -ForegroundColor Green
            }
            else {
                throw "Module installation verification failed"
            }
        }
        
        # Test module import
        Import-Module $module.Name -Force -ErrorAction Stop
        Write-Host "✓ Module '$($module.Name)' imported successfully" -ForegroundColor Green
        
    }
    catch {
        Write-Error "Failed to install/import module '$($module.Name)': $($_.Exception.Message)"
        Write-Host "Please try running this script as Administrator or check your internet connection." -ForegroundColor Red
        exit 1
    }
}

# Test Graph connection capability
Write-Host "`nTesting Microsoft Graph connection capability..." -ForegroundColor Yellow
try {
    # This should work without actually connecting
    $graphContext = Get-MgContext -ErrorAction SilentlyContinue
    Write-Host "✓ Microsoft Graph PowerShell SDK is ready for use" -ForegroundColor Green
}
catch {
    Write-Warning "Microsoft Graph context test failed, but modules are installed. This may be normal if not connected yet."
}

# Display system information
Write-Host "`n=== SYSTEM INFORMATION ===" -ForegroundColor Cyan
Write-Host "Operating System: $($env:OS)" -ForegroundColor White
Write-Host "Computer Name: $($env:COMPUTERNAME)" -ForegroundColor White
Write-Host "User: $($env:USERNAME)" -ForegroundColor White
Write-Host "PowerShell Edition: $($PSVersionTable.PSEdition)" -ForegroundColor White

# Check available memory
$memory = Get-CimInstance -ClassName Win32_ComputerSystem | Select-Object TotalPhysicalMemory
$memoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
Write-Host "Total Physical Memory: $memoryGB GB" -ForegroundColor White

if ($memoryGB -lt 8) {
    Write-Warning "System has less than 8GB RAM. Consider reducing batch sizes and thread counts for large datasets."
}
else {
    Write-Host "✓ Sufficient memory available for large dataset processing" -ForegroundColor Green
}

# Check CPU cores
$cpu = Get-CimInstance -ClassName Win32_Processor | Select-Object NumberOfCores, NumberOfLogicalProcessors
$cores = ($cpu | Measure-Object NumberOfCores -Sum).Sum
$logicalProcs = ($cpu | Measure-Object NumberOfLogicalProcessors -Sum).Sum
Write-Host "CPU Cores: $cores (Logical Processors: $logicalProcs)" -ForegroundColor White

# Provide performance recommendations
Write-Host "`n=== PERFORMANCE RECOMMENDATIONS ===" -ForegroundColor Cyan

if ($cores -le 4) {
    Write-Host "Recommended settings for your system:" -ForegroundColor Yellow
    Write-Host "- MaxThreads: 4-6" -ForegroundColor White
    Write-Host "- BatchSize: 100-250" -ForegroundColor White
}
elseif ($cores -le 8) {
    Write-Host "Recommended settings for your system:" -ForegroundColor Yellow
    Write-Host "- MaxThreads: 6-8" -ForegroundColor White
    Write-Host "- BatchSize: 250-350" -ForegroundColor White
}
else {
    Write-Host "Recommended settings for your system:" -ForegroundColor Yellow
    Write-Host "- MaxThreads: 10-12" -ForegroundColor White
    Write-Host "- BatchSize: 350-500" -ForegroundColor White
}

Write-Host "`n=== INSTALLATION COMPLETE ===" -ForegroundColor Green
Write-Host "All prerequisites have been installed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Prepare your CSV file with UserPrincipalName column" -ForegroundColor White
Write-Host "2. Run the main script: .\DisableUser_Optimized_Parallel.ps1 -CsvPath 'your-file.csv'" -ForegroundColor White
Write-Host "3. Or use the batch launcher: .\Run-UserDisableScript.bat" -ForegroundColor White
Write-Host "`nFor testing: .\Test-DisableUserScript.ps1" -ForegroundColor Cyan