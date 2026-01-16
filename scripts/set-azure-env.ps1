# PowerShell script to set Azure App Service environment variables
# Run this from PowerShell after logging in with: az login

$appName = "easemycargo77"
$resourceGroup = "your-resource-group-name"  # Update this with your actual resource group name

Write-Host "Setting environment variables for Azure App Service: $appName" -ForegroundColor Green

# Set the application settings
az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings `
        NUXT_PUBLIC_APP_URL="https://easemycargo77.azurewebsites.net" `
        PUBLIC_APP_URL="https://easemycargo77.azurewebsites.net" `
        SMTP_HOST="smtp.gmail.com" `
        SMTP_PORT="587" `
        SMTP_USER="YOUR_EMAIL_HERE" `
        SMTP_PASS="YOUR_APP_PASSWORD_HERE" `
        EMAIL_FROM="YOUR_EMAIL_HERE"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Restarting app service..." -ForegroundColor Yellow

# Restart the app service
az webapp restart --name $appName --resource-group $resourceGroup

Write-Host "Done! Your app should now use HTTPS URLs in emails." -ForegroundColor Green
