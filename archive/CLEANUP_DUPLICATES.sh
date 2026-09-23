#!/bin/bash
# 🧹 Cleanup Script - Remove Duplicate Files
# Usage: chmod +x CLEANUP_DUPLICATES.sh && ./CLEANUP_DUPLICATES.sh

echo "🔍 Yazgı Project - Duplicate File Cleanup"
echo "=========================================="
echo ""

# Check if files exist
if [ ! -f "App.native.tsx" ]; then
    echo "❌ Error: App.native.tsx not found!"
    exit 1
fi

if [ ! -f "App.native.refactored.tsx" ]; then
    echo "❌ Error: App.native.refactored.tsx not found!"
    exit 1
fi

# Compare files
echo "📊 Comparing files..."
if diff -q App.native.tsx App.native.refactored.tsx > /dev/null; then
    echo "✅ Files are identical"
    echo ""
    
    # Show file sizes
    echo "📏 File Information:"
    ls -lh App.native.tsx App.native.refactored.tsx
    echo ""
    
    # Confirmation prompt
    read -p "🗑️  Remove App.native.refactored.tsx? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup first (just in case)
        echo "💾 Creating backup..."
        cp App.native.refactored.tsx App.native.refactored.BACKUP_$(date +%Y%m%d_%H%M%S).tsx
        
        # Remove duplicate
        echo "🗑️  Removing duplicate..."
        rm App.native.refactored.tsx
        
        # Git operations
        if [ -d ".git" ]; then
            echo "📝 Staging git changes..."
            git add App.native.refactored.tsx 2>/dev/null || echo "⚠️  Not in git repo"
            
            read -p "📝 Commit changes? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git commit -m "chore: Remove duplicate App.native.refactored.tsx (identical to App.native.tsx)"
                echo "✅ Committed!"
            fi
        fi
        
        echo ""
        echo "✅ Cleanup complete!"
        echo "📁 Active file: App.native.tsx"
        echo "💾 Backup created: App.native.refactored.BACKUP_*.tsx"
        
    else
        echo "❌ Cleanup cancelled"
        exit 0
    fi
    
else
    echo "⚠️  WARNING: Files are different!"
    echo "   Please review differences manually before cleanup."
    echo ""
    echo "Run: diff App.native.tsx App.native.refactored.tsx"
    exit 1
fi

echo ""
echo "🎉 Done!"
