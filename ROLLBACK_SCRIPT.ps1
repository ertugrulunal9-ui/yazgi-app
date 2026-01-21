# ⏪ Rollback Script - Restore from Backup (PowerShell)
# Usage: .\ROLLBACK_SCRIPT.ps1

Write-Host "⏪ Yazgı Project - Rollback to Previous Version" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Red
Write-Host ""

# Check if backup exists
$backupFile = "App.native.backup.tsx"
$monolithBackup = "App.native.MONOLITH_BACKUP.tsx"

if (Test-Path $monolithBackup) {
    $backupToUse = $monolithBackup
    Write-Host "✅ Found: $monolithBackup" -ForegroundColor Green
} elseif (Test-Path $backupFile) {
    $backupToUse = $backupFile
    Write-Host "✅ Found: $backupFile" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No backup file found!" -ForegroundColor Red
    Write-Host "   Expected: $backupFile or $monolithBackup" -ForegroundColor Yellow
    exit 1
}

# Show current file info
Write-Host ""
Write-Host "📊 Current File:" -ForegroundColor Cyan
Get-ChildItem "App.native.tsx" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

Write-Host "💾 Backup File:" -ForegroundColor Cyan
Get-ChildItem $backupToUse | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

# Confirmation
Write-Host "⚠️  WARNING: This will overwrite App.native.tsx with $backupToUse" -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "Continue with rollback? (y/N)"

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Rollback cancelled" -ForegroundColor Red
    exit 0
}

# Create emergency backup of current file
Write-Host ""
Write-Host "💾 Creating emergency backup of current file..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item "App.native.tsx" "App.native.EMERGENCY_$timestamp.tsx"
Write-Host "✅ Saved as: App.native.EMERGENCY_$timestamp.tsx" -ForegroundColor Green

# Perform rollback
Write-Host ""
Write-Host "⏪ Rolling back..." -ForegroundColor Yellow
Copy-Item $backupToUse "App.native.tsx" -Force

# Verify
$newHash = (Get-FileHash "App.native.tsx").Hash
$backupHash = (Get-FileHash $backupToUse).Hash

if ($newHash -eq $backupHash) {
    Write-Host "✅ Rollback successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Active file: App.native.tsx (restored from $backupToUse)" -ForegroundColor Cyan
    Write-Host "💾 Emergency backup: App.native.EMERGENCY_$timestamp.tsx" -ForegroundColor Cyan
    
    # Git operations
    if (Test-Path ".git") {
        Write-Host ""
        $gitConfirm = Read-Host "📝 Stage rollback in git? (y/N)"
        if ($gitConfirm -eq 'y' -or $gitConfirm -eq 'Y') {
            git add App.native.tsx
            git commit -m "revert: Rollback App.native.tsx to $backupToUse"
            Write-Host "✅ Git commit created!" -ForegroundColor Green
        }
    }
    
    # Next steps
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Run: npm start" -ForegroundColor White
    Write-Host "   2. Test the app" -ForegroundColor White
    Write-Host "   3. If issues persist, check App.native.EMERGENCY_$timestamp.tsx" -ForegroundColor White
    
} else {
    Write-Host "❌ Rollback failed: File hashes don't match" -ForegroundColor Red
    Write-Host "   Restoring emergency backup..." -ForegroundColor Yellow
    Copy-Item "App.native.EMERGENCY_$timestamp.tsx" "App.native.tsx" -Force
    Write-Host "✅ Emergency backup restored" -ForegroundColor Green
    exit 1
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
