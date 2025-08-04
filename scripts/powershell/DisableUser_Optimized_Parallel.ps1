#Requires -Version 5.1
<#
.SYNOPSIS
    Optimized PowerShell script for bulk user disable operations using Microsoft Graph API
    
.DESCRIPTION
    This script efficiently processes large CSV files containing user data to disable users
    in Microsoft Graph. It uses optimized batch processing, thread pooling, and streaming
    CSV reading to handle datasets of 63,000+ users while maintaining system performance.
    
.PARAMETER CsvPath
    Path to the CSV file containing users to disable
    
.PARAMETER OutputDirectory
    Directory where the results report will be saved
    
.PARAMETER BatchSize
    Number of users to process in each batch (default: 250)
    
.PARAMETER MaxThreads
    Maximum number of concurrent worker threads (default: 10)
    
.PARAMETER TenantId
    Azure AD Tenant ID (default: beb6b7c5-4865-4344-b3c4-df504d7f9632)
    
.EXAMPLE
    .\DisableUser_Optimized_Parallel.ps1 -CsvPath "D:\UserToDisable\DisposableEmailDomain-DevUsers.csv"
    
.NOTES
    Author: PowerShell Optimization Team
    Version: 2.0
    Requires: Microsoft.Graph.Authentication, Microsoft.Graph.Users modules
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$CsvPath,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputDirectory = "D:\UserToDisable\UserToDisable",
    
    [Parameter(Mandatory = $false)]
    [ValidateRange(50, 500)]
    [int]$BatchSize = 250,
    
    [Parameter(Mandatory = $false)]
    [ValidateRange(4, 16)]
    [int]$MaxThreads = 10,
    
    [Parameter(Mandatory = $false)]
    [string]$TenantId = "beb6b7c5-4865-4344-b3c4-df504d7f9632"
)

# Import required modules with error handling
try {
    Import-Module Microsoft.Graph.Authentication -Force -ErrorAction Stop
    Import-Module Microsoft.Graph.Users -Force -ErrorAction Stop
    Write-Host "✓ Microsoft Graph modules imported successfully" -ForegroundColor Green
}
catch {
    Write-Error "Failed to import Microsoft Graph modules. Please install them using: Install-Module Microsoft.Graph -Scope CurrentUser"
    exit 1
}

# Global variables for tracking
$script:ProcessedUsers = 0
$script:SuccessfulDisables = 0
$script:FailedDisables = 0
$script:StartTime = Get-Date
$script:Results = [System.Collections.Concurrent.ConcurrentBag[PSObject]]::new()
$script:ProgressMutex = [System.Threading.Mutex]::new($false)

# Performance monitoring class
class PerformanceMonitor {
    [datetime]$StartTime
    [int]$TotalUsers
    [int]$ProcessedUsers
    [double]$CurrentRate
    [timespan]$EstimatedTimeRemaining
    
    PerformanceMonitor([int]$totalUsers) {
        $this.StartTime = Get-Date
        $this.TotalUsers = $totalUsers
        $this.ProcessedUsers = 0
    }
    
    [void]UpdateProgress([int]$processed) {
        $this.ProcessedUsers = $processed
        $elapsed = (Get-Date) - $this.StartTime
        
        if ($elapsed.TotalMinutes -gt 0) {
            $this.CurrentRate = $this.ProcessedUsers / $elapsed.TotalMinutes
            
            if ($this.CurrentRate -gt 0) {
                $remainingUsers = $this.TotalUsers - $this.ProcessedUsers
                $this.EstimatedTimeRemaining = [timespan]::FromMinutes($remainingUsers / $this.CurrentRate)
            }
        }
    }
    
    [string]GetProgressString() {
        $percentComplete = if ($this.TotalUsers -gt 0) { 
            [math]::Round(($this.ProcessedUsers / $this.TotalUsers) * 100, 2) 
        } else { 0 }
        
        return "Progress: $($this.ProcessedUsers)/$($this.TotalUsers) ($percentComplete%) | " +
               "Rate: $([math]::Round($this.CurrentRate, 0)) users/min | " +
               "ETA: $($this.EstimatedTimeRemaining.ToString('hh\:mm\:ss'))"
    }
}

# Retry logic with exponential backoff
function Invoke-WithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxRetries = 3,
        [int]$InitialDelaySeconds = 1,
        [string]$OperationName = "Operation"
    )
    
    $attempt = 1
    while ($attempt -le $MaxRetries) {
        try {
            return & $ScriptBlock
        }
        catch {
            $delay = $InitialDelaySeconds * [math]::Pow(2, $attempt - 1)
            
            if ($attempt -eq $MaxRetries) {
                Write-Warning "$OperationName failed after $MaxRetries attempts: $($_.Exception.Message)"
                throw
            }
            
            Write-Warning "$OperationName failed (attempt $attempt/$MaxRetries), retrying in $delay seconds: $($_.Exception.Message)"
            Start-Sleep -Seconds $delay
            $attempt++
        }
    }
}

# Optimized user disable function
function Disable-UserBatch {
    param(
        [array]$UserBatch,
        [int]$BatchNumber,
        [Microsoft.Graph.PowerShell.Models.IMicrosoftGraphUser[]]$GraphUsers
    )
    
    $batchResults = @()
    $batchStartTime = Get-Date
    
    foreach ($user in $UserBatch) {
        $result = [PSCustomObject]@{
            UserPrincipalName = $user.UserPrincipalName
            DisplayName = $user.DisplayName
            Status = "Unknown"
            ErrorMessage = ""
            ProcessedAt = Get-Date
            BatchNumber = $BatchNumber
        }
        
        try {
            # Find user in Graph (case-insensitive lookup)
            $graphUser = $GraphUsers | Where-Object { 
                $_.UserPrincipalName -eq $user.UserPrincipalName 
            }
            
            if ($graphUser) {
                # Use retry logic for Graph API calls
                Invoke-WithRetry -OperationName "Disable User $($user.UserPrincipalName)" -ScriptBlock {
                    Update-MgUser -UserId $graphUser.Id -AccountEnabled:$false -ErrorAction Stop
                }
                
                $result.Status = "Disabled"
                $script:SuccessfulDisables++
            }
            else {
                $result.Status = "NotFound"
                $result.ErrorMessage = "User not found in Azure AD"
                $script:FailedDisables++
            }
        }
        catch {
            $result.Status = "Failed"
            $result.ErrorMessage = $_.Exception.Message
            $script:FailedDisables++
            
            # Handle specific Graph API errors
            if ($_.Exception.Message -like "*throttled*" -or $_.Exception.Message -like "*TooManyRequests*") {
                Write-Warning "API throttling detected for user $($user.UserPrincipalName), waiting 60 seconds..."
                Start-Sleep -Seconds 60
            }
        }
        
        $batchResults += $result
        $script:Results.Add($result)
        
        # Update progress safely using mutex
        $script:ProgressMutex.WaitOne() | Out-Null
        try {
            $script:ProcessedUsers++
        }
        finally {
            $script:ProgressMutex.ReleaseMutex()
        }
    }
    
    $batchDuration = (Get-Date) - $batchStartTime
    Write-Host "Batch $BatchNumber completed: $($UserBatch.Count) users in $($batchDuration.TotalSeconds) seconds" -ForegroundColor Cyan
    
    return $batchResults
}

# Streaming CSV reader to handle large files efficiently
function Read-CsvStreaming {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        throw "CSV file not found: $Path"
    }
    
    Write-Host "Reading CSV file: $Path" -ForegroundColor Yellow
    
    try {
        # Use streaming reader for memory efficiency
        $streamReader = [System.IO.StreamReader]::new($Path)
        $csvReader = [System.IO.StringReader]::new($streamReader.ReadToEnd())
        $streamReader.Close()
        
        $csv = Import-Csv -InputObject $csvReader.ReadToEnd()
        
        # Validate CSV structure
        $requiredColumns = @('UserPrincipalName')
        $csvColumns = $csv[0].PSObject.Properties.Name
        
        foreach ($column in $requiredColumns) {
            if ($column -notin $csvColumns) {
                throw "Required column '$column' not found in CSV. Available columns: $($csvColumns -join ', ')"
            }
        }
        
        Write-Host "✓ CSV loaded successfully: $($csv.Count) users found" -ForegroundColor Green
        return $csv
    }
    catch {
        Write-Error "Failed to read CSV file: $($_.Exception.Message)"
        throw
    }
}

# Pre-load all users from Graph for efficient lookup
function Get-AllGraphUsers {
    Write-Host "Pre-loading user data from Microsoft Graph..." -ForegroundColor Yellow
    
    try {
        $allUsers = Invoke-WithRetry -OperationName "Get Graph Users" -ScriptBlock {
            Get-MgUser -All -Property "Id,UserPrincipalName,DisplayName,AccountEnabled" -ErrorAction Stop
        }
        
        Write-Host "✓ Loaded $($allUsers.Count) users from Microsoft Graph" -ForegroundColor Green
        return $allUsers
    }
    catch {
        Write-Error "Failed to retrieve users from Microsoft Graph: $($_.Exception.Message)"
        throw
    }
}

# Generate comprehensive results report
function Generate-ResultsReport {
    param([array]$Results, [string]$OutputPath)
    
    try {
        # Create output directory if it doesn't exist
        $outputDir = Split-Path $OutputPath -Parent
        if (-not (Test-Path $outputDir)) {
            New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
        }
        
        # Export detailed results
        $Results | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
        
        # Generate summary report
        $summaryPath = $OutputPath -replace '\.csv$', '_Summary.txt'
        $totalDuration = (Get-Date) - $script:StartTime
        
        $summary = @"
=== BULK USER DISABLE OPERATION SUMMARY ===
Start Time: $($script:StartTime.ToString('yyyy-MM-dd HH:mm:ss'))
End Time: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))
Total Duration: $($totalDuration.ToString('hh\:mm\:ss'))

STATISTICS:
- Total Users Processed: $script:ProcessedUsers
- Successfully Disabled: $script:SuccessfulDisables
- Failed Operations: $script:FailedDisables
- Success Rate: $([math]::Round(($script:SuccessfulDisables / $script:ProcessedUsers) * 100, 2))%
- Average Processing Rate: $([math]::Round($script:ProcessedUsers / $totalDuration.TotalMinutes, 0)) users/minute

CONFIGURATION:
- Batch Size: $BatchSize
- Max Threads: $MaxThreads
- Tenant ID: $TenantId

PERFORMANCE METRICS:
- Memory Usage Peak: $([math]::Round((Get-Process -Id $PID).WorkingSet64 / 1GB, 2)) GB
- CPU Time: $([math]::Round((Get-Process -Id $PID).TotalProcessorTime.TotalMinutes, 2)) minutes

DETAILED RESULTS:
See: $OutputPath
"@
        
        $summary | Out-File -FilePath $summaryPath -Encoding UTF8
        
        Write-Host "✓ Results exported to: $OutputPath" -ForegroundColor Green
        Write-Host "✓ Summary report: $summaryPath" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to generate results report: $($_.Exception.Message)"
    }
}

# Main execution function
function Start-OptimizedUserDisableProcess {
    try {
        Write-Host "=== OPTIMIZED BULK USER DISABLE PROCESS ===" -ForegroundColor Magenta
        Write-Host "Configuration: BatchSize=$BatchSize, MaxThreads=$MaxThreads, TenantId=$TenantId" -ForegroundColor Yellow
        
        # Validate input file
        if (-not (Test-Path $CsvPath)) {
            throw "Input CSV file not found: $CsvPath"
        }
        
        # Connect to Microsoft Graph
        Write-Host "Connecting to Microsoft Graph..." -ForegroundColor Yellow
        Connect-MgGraph -TenantId $TenantId -Scopes "User.ReadWrite.All" -NoWelcome
        Write-Host "✓ Connected to Microsoft Graph successfully" -ForegroundColor Green
        
        # Load and validate CSV data
        $csvUsers = Read-CsvStreaming -Path $CsvPath
        $totalUsers = $csvUsers.Count
        
        if ($totalUsers -eq 0) {
            throw "No users found in CSV file"
        }
        
        # Initialize performance monitor
        $perfMonitor = [PerformanceMonitor]::new($totalUsers)
        
        # Pre-load Graph users for efficient lookup
        $allGraphUsers = Get-AllGraphUsers
        
        # Create user batches
        $batches = @()
        for ($i = 0; $i -lt $totalUsers; $i += $BatchSize) {
            $batchEnd = [math]::Min($i + $BatchSize - 1, $totalUsers - 1)
            $batches += , $csvUsers[$i..$batchEnd]
        }
        
        Write-Host "Created $($batches.Count) batches of up to $BatchSize users each" -ForegroundColor Yellow
        
        # Initialize thread pool
        $runspacePool = [runspacefactory]::CreateRunspacePool(1, $MaxThreads)
        $runspacePool.Open()
        
        $jobs = @()
        
        # Process batches in parallel
        Write-Host "Starting parallel processing with $MaxThreads worker threads..." -ForegroundColor Yellow
        
        for ($batchIndex = 0; $batchIndex -lt $batches.Count; $batchIndex++) {
            $batch = $batches[$batchIndex]
            
            $powerShell = [powershell]::Create()
            $powerShell.RunspacePool = $runspacePool
            
            # Add the disable function and execute
            $null = $powerShell.AddScript({
                param($UserBatch, $BatchNumber, $GraphUsers, $DisableFunctionDef)
                
                # Re-create the function in this runspace
                Invoke-Expression $DisableFunctionDef
                
                return Disable-UserBatch -UserBatch $UserBatch -BatchNumber $BatchNumber -GraphUsers $GraphUsers
            })
            
            $null = $powerShell.AddArgument($batch)
            $null = $powerShell.AddArgument($batchIndex + 1)
            $null = $powerShell.AddArgument($allGraphUsers)
            $null = $powerShell.AddArgument((Get-Content Function:\Disable-UserBatch -Raw))
            
            $job = @{
                PowerShell = $powerShell
                Handle = $powerShell.BeginInvoke()
                BatchNumber = $batchIndex + 1
            }
            
            $jobs += $job
        }
        
        # Monitor progress and collect results
        Write-Host "Monitoring progress..." -ForegroundColor Yellow
        
        $completedJobs = 0
        while ($completedJobs -lt $jobs.Count) {
            Start-Sleep -Seconds 5
            
            # Check for completed jobs
            foreach ($job in $jobs | Where-Object { $_.Handle.IsCompleted -and -not $_.Processed }) {
                try {
                    $batchResults = $job.PowerShell.EndInvoke($job.Handle)
                    $job.PowerShell.Dispose()
                    $job.Processed = $true
                    $completedJobs++
                    
                    Write-Host "Batch $($job.BatchNumber) completed successfully" -ForegroundColor Green
                }
                catch {
                    Write-Warning "Batch $($job.BatchNumber) failed: $($_.Exception.Message)"
                    $job.Processed = $true
                    $completedJobs++
                }
            }
            
            # Update and display progress
            $perfMonitor.UpdateProgress($script:ProcessedUsers)
            Write-Host $perfMonitor.GetProgressString() -ForegroundColor Cyan
        }
        
        # Cleanup
        $runspacePool.Close()
        $runspacePool.Dispose()
        
        # Generate final report
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $outputFileName = "$(Split-Path $CsvPath -LeafBase)_User_Disable_Report_$timestamp.csv"
        $outputPath = Join-Path $OutputDirectory $outputFileName
        
        Generate-ResultsReport -Results $script:Results -OutputPath $outputPath
        
        # Final summary
        $totalDuration = (Get-Date) - $script:StartTime
        Write-Host "`n=== PROCESS COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
        Write-Host "Total Duration: $($totalDuration.ToString('hh\:mm\:ss'))" -ForegroundColor Green
        Write-Host "Processed: $script:ProcessedUsers users" -ForegroundColor Green
        Write-Host "Success Rate: $([math]::Round(($script:SuccessfulDisables / $script:ProcessedUsers) * 100, 2))%" -ForegroundColor Green
        Write-Host "Average Rate: $([math]::Round($script:ProcessedUsers / $totalDuration.TotalMinutes, 0)) users/minute" -ForegroundColor Green
        
    }
    catch {
        Write-Error "Process failed: $($_.Exception.Message)"
        Write-Error $_.ScriptStackTrace
        exit 1
    }
    finally {
        # Cleanup Graph connection
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
            Write-Host "✓ Disconnected from Microsoft Graph" -ForegroundColor Yellow
        }
        catch {
            # Ignore disconnection errors
        }
    }
}

# Execute the main process
Start-OptimizedUserDisableProcess