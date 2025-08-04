#Requires -Version 5.1
<#
.SYNOPSIS
    PowerShell profile script for bulk user disable operations
    
.DESCRIPTION
    This script sets up the PowerShell environment with helpful functions
    and aliases for running the optimized user disable script efficiently.
    
.NOTES
    Load this profile by running: . .\PowerShell-Profile.ps1
#>

# Set strict mode for better error handling
Set-StrictMode -Version Latest

# Import required modules if available
$ModulesToImport = @(
    "Microsoft.Graph.Authentication",
    "Microsoft.Graph.Users"
)

foreach ($Module in $ModulesToImport) {
    if (Get-Module -ListAvailable -Name $Module) {
        try {
            Import-Module $Module -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Imported module: $Module" -ForegroundColor Green
        }
        catch {
            Write-Warning "Failed to import module: $Module"
        }
    }
    else {
        Write-Warning "Module not found: $Module. Run Install-Prerequisites.ps1 to install."
    }
}

# Helper functions for user disable operations
function Start-SmallDatasetDisable {
    <#
    .SYNOPSIS
        Quick function for small datasets (< 1,000 users)
    #>
    param(
        [Parameter(Mandatory = $true)]
        [string]$CsvPath
    )
    
    Write-Host "Starting small dataset processing..." -ForegroundColor Yellow
    & ".\DisableUser_Optimized_Parallel.ps1" -CsvPath $CsvPath -BatchSize 100 -MaxThreads 4
}

function Start-MediumDatasetDisable {
    <#
    .SYNOPSIS
        Quick function for medium datasets (1,000-10,000 users)
    #>
    param(
        [Parameter(Mandatory = $true)]
        [string]$CsvPath
    )
    
    Write-Host "Starting medium dataset processing..." -ForegroundColor Yellow
    & ".\DisableUser_Optimized_Parallel.ps1" -CsvPath $CsvPath -BatchSize 250 -MaxThreads 8
}

function Start-LargeDatasetDisable {
    <#
    .SYNOPSIS
        Quick function for large datasets (10,000+ users)
    #>
    param(
        [Parameter(Mandatory = $true)]
        [string]$CsvPath,
        
        [Parameter(Mandatory = $false)]
        [string]$OutputDirectory = "D:\UserToDisable\UserToDisable"
    )
    
    Write-Host "Starting large dataset processing (optimized for 63,651+ users)..." -ForegroundColor Yellow
    & ".\DisableUser_Optimized_Parallel.ps1" -CsvPath $CsvPath -BatchSize 500 -MaxThreads 12 -OutputDirectory $OutputDirectory
}

function Test-UserDisableEnvironment {
    <#
    .SYNOPSIS
        Tests the environment and script functionality
    #>
    Write-Host "Testing user disable environment..." -ForegroundColor Yellow
    & ".\Test-DisableUserScript.ps1"
}

function Install-UserDisablePrerequisites {
    <#
    .SYNOPSIS
        Installs required PowerShell modules
    #>
    param(
        [switch]$Force,
        [string]$Scope = "CurrentUser"
    )
    
    & ".\Install-Prerequisites.ps1" -Force:$Force -Scope $Scope
}

function Get-UserDisableHelp {
    <#
    .SYNOPSIS
        Displays help and usage examples
    #>
    
    Write-Host "`n=== OPTIMIZED USER DISABLE SCRIPT HELP ===" -ForegroundColor Magenta
    Write-Host "`nQuick Start Functions:" -ForegroundColor Yellow
    Write-Host "  Start-SmallDatasetDisable -CsvPath 'path\to\file.csv'" -ForegroundColor White
    Write-Host "  Start-MediumDatasetDisable -CsvPath 'path\to\file.csv'" -ForegroundColor White
    Write-Host "  Start-LargeDatasetDisable -CsvPath 'path\to\file.csv'" -ForegroundColor White
    
    Write-Host "`nUtility Functions:" -ForegroundColor Yellow
    Write-Host "  Test-UserDisableEnvironment" -ForegroundColor White
    Write-Host "  Install-UserDisablePrerequisites" -ForegroundColor White
    Write-Host "  Get-SystemPerformanceInfo" -ForegroundColor White
    Write-Host "  Get-UserDisableHelp" -ForegroundColor White
    
    Write-Host "`nDirect Script Usage:" -ForegroundColor Yellow
    Write-Host "  .\DisableUser_Optimized_Parallel.ps1 -CsvPath 'file.csv' -BatchSize 500 -MaxThreads 12" -ForegroundColor White
    
    Write-Host "`nBatch Launcher:" -ForegroundColor Yellow
    Write-Host "  .\Run-UserDisableScript.bat" -ForegroundColor White
    
    Write-Host "`nConfiguration Files:" -ForegroundColor Yellow
    Write-Host "  README.md - Detailed configuration guide" -ForegroundColor White
    Write-Host "  sample_users.csv - Sample CSV format" -ForegroundColor White
}

function Get-SystemPerformanceInfo {
    <#
    .SYNOPSIS
        Displays system information and performance recommendations
    #>
    
    Write-Host "`n=== SYSTEM PERFORMANCE INFORMATION ===" -ForegroundColor Cyan
    
    # Memory information
    $memory = Get-CimInstance -ClassName Win32_ComputerSystem
    $memoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
    Write-Host "Total Physical Memory: $memoryGB GB" -ForegroundColor White
    
    # CPU information
    $cpu = Get-CimInstance -ClassName Win32_Processor
    $cores = ($cpu | Measure-Object NumberOfCores -Sum).Sum
    $logicalProcs = ($cpu | Measure-Object NumberOfLogicalProcessors -Sum).Sum
    Write-Host "CPU Cores: $cores (Logical Processors: $logicalProcs)" -ForegroundColor White
    
    # PowerShell version
    Write-Host "PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor White
    
    # Recommendations
    Write-Host "`nRecommended Settings:" -ForegroundColor Yellow
    if ($cores -le 4) {
        Write-Host "  MaxThreads: 4-6, BatchSize: 100-250" -ForegroundColor Green
    }
    elseif ($cores -le 8) {
        Write-Host "  MaxThreads: 6-8, BatchSize: 250-350" -ForegroundColor Green
    }
    else {
        Write-Host "  MaxThreads: 10-12, BatchSize: 350-500" -ForegroundColor Green
    }
    
    # Memory recommendations
    if ($memoryGB -lt 8) {
        Write-Host "  Warning: Less than 8GB RAM. Use smaller batch sizes." -ForegroundColor Red
    }
    elseif ($memoryGB -ge 16) {
        Write-Host "  System well-suited for large dataset processing (63,651+ users)" -ForegroundColor Green
    }
    else {
        Write-Host "  System suitable for medium to large datasets" -ForegroundColor Yellow
    }
}

function Get-CsvUserCount {
    <#
    .SYNOPSIS
        Counts users in a CSV file without loading it fully into memory
    #>
    param(
        [Parameter(Mandatory = $true)]
        [string]$CsvPath
    )
    
    if (-not (Test-Path $CsvPath)) {
        Write-Error "CSV file not found: $CsvPath"
        return
    }
    
    try {
        $lineCount = (Get-Content $CsvPath | Measure-Object -Line).Lines - 1  # Subtract header
        Write-Host "CSV file contains $lineCount users" -ForegroundColor Green
        
        # Provide recommendations based on count
        if ($lineCount -lt 1000) {
            Write-Host "Recommendation: Use Start-SmallDatasetDisable" -ForegroundColor Yellow
        }
        elseif ($lineCount -lt 10000) {
            Write-Host "Recommendation: Use Start-MediumDatasetDisable" -ForegroundColor Yellow
        }
        else {
            Write-Host "Recommendation: Use Start-LargeDatasetDisable" -ForegroundColor Yellow
        }
        
        return $lineCount
    }
    catch {
        Write-Error "Failed to count users in CSV: $($_.Exception.Message)"
    }
}

# Set up aliases for convenience
Set-Alias -Name "small" -Value Start-SmallDatasetDisable
Set-Alias -Name "medium" -Value Start-MediumDatasetDisable
Set-Alias -Name "large" -Value Start-LargeDatasetDisable
Set-Alias -Name "test" -Value Test-UserDisableEnvironment
Set-Alias -Name "install" -Value Install-UserDisablePrerequisites
Set-Alias -Name "help" -Value Get-UserDisableHelp
Set-Alias -Name "sysinfo" -Value Get-SystemPerformanceInfo
Set-Alias -Name "count" -Value Get-CsvUserCount

# Display welcome message
Write-Host "`n=== OPTIMIZED USER DISABLE ENVIRONMENT LOADED ===" -ForegroundColor Green
Write-Host "Type 'help' for available commands and usage examples" -ForegroundColor Yellow
Write-Host "Type 'sysinfo' to see system performance information" -ForegroundColor Yellow
Write-Host "Type 'test' to validate your environment" -ForegroundColor Yellow

# Quick system check
$memoryGB = [math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
$cores = (Get-CimInstance -ClassName Win32_Processor | Measure-Object NumberOfCores -Sum).Sum

Write-Host "`nSystem: $cores cores, $memoryGB GB RAM" -ForegroundColor Cyan

if ($memoryGB -ge 16 -and $cores -ge 8) {
    Write-Host "✓ System optimized for large dataset processing (63,651+ users)" -ForegroundColor Green
}
elseif ($memoryGB -ge 8 -and $cores -ge 4) {
    Write-Host "✓ System suitable for medium to large datasets" -ForegroundColor Yellow
}
else {
    Write-Host "⚠ Consider upgrading system resources for optimal performance" -ForegroundColor Red
}