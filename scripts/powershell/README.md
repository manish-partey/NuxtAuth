# PowerShell User Disable Script Configuration
# This file contains configuration parameters and guidelines for the optimized user disable script

## Required PowerShell Modules
# Install the following modules before running the script:
# Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force
# Install-Module Microsoft.Graph.Users -Scope CurrentUser -Force

## System Requirements
# - PowerShell 5.1 or higher
# - Minimum 8GB RAM (16GB+ recommended for large datasets)
# - Stable internet connection for Microsoft Graph API calls
# - Appropriate Azure AD permissions (User.ReadWrite.All scope)

## Performance Tuning Guidelines

### Batch Size Configuration
# - Small datasets (< 1,000 users): BatchSize = 100
# - Medium datasets (1,000 - 10,000 users): BatchSize = 250
# - Large datasets (10,000+ users): BatchSize = 500
# - Maximum recommended: 500 users per batch

### Thread Pool Configuration
# Based on system resources:
# - 4 CPU cores: MaxThreads = 4-6
# - 8 CPU cores: MaxThreads = 8-10
# - 16 CPU cores: MaxThreads = 10-12
# - Maximum recommended: 16 threads

### Memory Considerations
# Expected memory usage:
# - Base script: ~200MB
# - Per 10,000 users: ~50MB additional
# - Per thread: ~25MB additional
# Monitor memory usage and adjust threads if approaching system limits

## CSV File Format Requirements
# The input CSV file must contain the following columns:
# - UserPrincipalName (Required): The user's UPN in Azure AD
# - DisplayName (Optional): User's display name for logging
# 
# Example CSV format:
# UserPrincipalName,DisplayName
# user1@contoso.com,John Doe
# user2@contoso.com,Jane Smith

## Error Handling and Retry Logic
# The script includes automatic retry logic for:
# - API throttling (429 errors)
# - Temporary network issues
# - Authentication token refresh
# 
# Retry configuration:
# - Maximum retries: 3 attempts
# - Exponential backoff: 1s, 2s, 4s delays
# - Special handling for API throttling: 60s delay

## Output Files
# The script generates two output files:
# 1. Detailed CSV report: Contains status for each user
# 2. Summary text report: Contains performance metrics and statistics

## Monitoring and Troubleshooting
# - Progress updates every 5 seconds
# - Real-time processing rate calculation
# - Memory and CPU usage tracking
# - Comprehensive error logging

## Security Considerations
# - Uses Microsoft Graph API with minimal required permissions
# - Automatic token management and refresh
# - Secure credential handling through Graph SDK
# - No passwords or sensitive data stored in logs

## Expected Performance Targets
# Target processing rates (users per minute):
# - 4 threads, 100 batch size: 800-1,200 users/min
# - 8 threads, 250 batch size: 1,500-2,000 users/min
# - 12 threads, 500 batch size: 2,000-2,500 users/min
#
# Factors affecting performance:
# - Network latency to Microsoft Graph
# - Azure AD tenant size and load
# - System resources (CPU, memory, disk I/O)
# - API throttling limits

## Usage Examples

# Basic usage with default settings:
# .\DisableUser_Optimized_Parallel.ps1 -CsvPath "C:\Data\users.csv"

# Optimized for large dataset:
# .\DisableUser_Optimized_Parallel.ps1 -CsvPath "C:\Data\users.csv" -BatchSize 500 -MaxThreads 12

# Custom output location:
# .\DisableUser_Optimized_Parallel.ps1 -CsvPath "C:\Data\users.csv" -OutputDirectory "C:\Reports"

# Different tenant:
# .\DisableUser_Optimized_Parallel.ps1 -CsvPath "C:\Data\users.csv" -TenantId "your-tenant-id"