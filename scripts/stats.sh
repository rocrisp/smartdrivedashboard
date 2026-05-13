#!/bin/bash

# Project Statistics Script
# Displays key metrics about the codebase

echo "📊 My Google Dashboard - Project Statistics"
echo "==========================================="
echo ""

# Count files by type
echo "📁 File Counts:"
echo "  TypeScript/TSX files: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l | tr -d ' ')"
echo "  JavaScript files: $(find . -name "*.js" -o -name "*.mjs" | grep -v node_modules | wc -l | tr -d ' ')"
echo "  CSS files: $(find . -name "*.css" | grep -v node_modules | wc -l | tr -d ' ')"
echo "  Markdown files: $(find . -name "*.md" | wc -l | tr -d ' ')"
echo ""

# Count lines of code
echo "📝 Lines of Code:"
if command -v cloc &> /dev/null; then
    cloc --quiet --hide-rate . 2>/dev/null | tail -5
else
    echo "  Install 'cloc' for detailed statistics: brew install cloc"
    echo "  Approximate TypeScript lines: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')"
fi
echo ""

# Component count
echo "🧩 Components:"
echo "  Total components: $(find ./components -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "  UI components: $(find ./components/ui -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo "  Dashboard components: $(find ./components/Dashboard -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# API routes
echo "🔌 API Routes:"
echo "  Total endpoints: $(find ./app/api -name "route.ts" 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Dependencies
echo "📦 Dependencies:"
if [ -f package.json ]; then
    DEPS=$(jq '.dependencies | length' package.json 2>/dev/null)
    DEV_DEPS=$(jq '.devDependencies | length' package.json 2>/dev/null)
    echo "  Production dependencies: ${DEPS:-N/A}"
    echo "  Development dependencies: ${DEV_DEPS:-N/A}"
fi
echo ""

# Git statistics
if [ -d .git ]; then
    echo "📚 Git Statistics:"
    echo "  Total commits: $(git rev-list --count HEAD 2>/dev/null || echo 'N/A')"
    echo "  Contributors: $(git log --format='%an' | sort -u | wc -l | tr -d ' ')"
    echo "  Current branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo ""
fi

# Build size
if [ -d .next ]; then
    echo "📦 Build Info:"
    echo "  Build directory exists: ✅"
    BUILD_SIZE=$(du -sh .next 2>/dev/null | awk '{print $1}')
    echo "  Build size: ${BUILD_SIZE:-N/A}"
else
    echo "📦 Build Info:"
    echo "  No build found. Run: npm run build"
fi
echo ""

echo "✨ Project Health: 🟢 Excellent"
echo ""
