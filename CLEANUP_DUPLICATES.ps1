# Cleanup Script - Remove Duplicate Files (PowerShell)
# Usage: .\CLEANUP_DUPLICATES.ps1

Write-Host "Yazgi Project - Duplicate File Cleanup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
if (-not (Test-Path "App.native.tsx")) {
    Write-Host "Error: App.native.tsx not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "App.native.refactored.tsx")) {
    Write-Host "Error: App.native.refactored.tsx not found!" -ForegroundColor Red
    exit 1
}

# Compare files
Write-Host "Comparing files..." -ForegroundColor Yellow

$file1Hash = (Get-FileHash "App.native.tsx").Hash
$file2Hash = (Get-FileHash "App.native.refactored.tsx").Hash

if ($file1Hash -eq $file2Hash) {
    Write-Host "Files are identical" -ForegroundColor Green
    Write-Host ""
    
    # Show file sizes
    Write-Host "File Information:" -ForegroundColor Cyan
    Get-ChildItem App.native.tsx, App.native.refactored.tsx | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
    Write-Host ""
    
    # Confirmation prompt
    $confirmation = Read-Host "Remove App.native.refactored.tsx? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        # Backup first (just in case)
        Write-Host "Creating backup..." -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item "App.native.refactored.tsx" "App.native.refactored.BACKUP_$timestamp.tsx"
        
        # Remove duplicate
        Write-Host "Removing duplicate..." -ForegroundColor Yellow
        Remove-Item "App.native.refactored.tsx"
        
        # Git operations
        if (Test-Path ".git") {
            Write-Host "Staging git changes..." -ForegroundColor Yellow
            git add App.native.refactored.tsx 2>$null
            
            $commitConfirm = Read-Host "Commit changes? (y/N)"
            if ($commitConfirm -eq 'y' -or $commitConfirm -eq 'Y') {
                git commit -m "chore: Remove duplicate App.native.refactored.tsx (identical to App.native.tsx)"
                Write-Host "Committed!" -ForegroundColor Green
            }
        }
        
        Write-Host ""
        Write-Host "Cleanup complete!" -ForegroundColor Green
        Write-Host "Active file: App.native.tsx" -ForegroundColor Cyan
        Write-Host "Backup created: App.native.refactored.BACKUP_$timestamp.tsx" -ForegroundColor Cyan
        
    } else {
        Write-Host "Cleanup cancelled" -ForegroundColor Red
        exit 0
    }
    
} else {
    Write-Host "WARNING: Files are different!" -ForegroundColor Red
    Write-Host "   Please review differences manually before cleanup." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: Compare-Object (Get-Content App.native.tsx) (Get-Content App.native.refactored.tsx)" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
