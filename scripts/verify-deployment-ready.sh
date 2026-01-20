#!/bin/bash

# Deployment Readiness Verification Script
# Checks if the application is ready for production deployment

echo "🔍 Verifying Deployment Readiness..."
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Check 1: Backend package.json exists
echo "📦 Checking backend configuration..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} Backend package.json found"
else
    echo -e "${RED}✗${NC} Backend package.json not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Frontend package.json exists
echo "📦 Checking frontend configuration..."
if [ -f "frontend-new/package.json" ]; then
    echo -e "${GREEN}✓${NC} Frontend package.json found"
else
    echo -e "${RED}✗${NC} Frontend package.json not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Prisma schema exists
echo "🗄️  Checking database schema..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma schema found"
else
    echo -e "${RED}✗${NC} Prisma schema not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Render configuration exists
echo "☁️  Checking Render configuration..."
if [ -f "render.yaml" ]; then
    echo -e "${GREEN}✓${NC} render.yaml found"
else
    echo -e "${RED}✗${NC} render.yaml not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Netlify configuration exists
echo "🌐 Checking Netlify configuration..."
if [ -f "netlify.toml" ]; then
    echo -e "${GREEN}✓${NC} netlify.toml found"
else
    echo -e "${RED}✗${NC} netlify.toml not found"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Deployment guide exists
echo "📚 Checking deployment documentation..."
if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} DEPLOYMENT_GUIDE.md found"
else
    echo -e "${YELLOW}⚠${NC} DEPLOYMENT_GUIDE.md not found (recommended)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 7: Environment variable examples exist
echo "🔐 Checking environment variable templates..."
if [ -f ".env.production.example" ]; then
    echo -e "${GREEN}✓${NC} Backend .env.production.example found"
else
    echo -e "${YELLOW}⚠${NC} Backend .env.production.example not found (recommended)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "frontend-new/.env.production.example" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env.production.example found"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env.production.example not found (recommended)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 8: TypeScript compilation
echo "🔨 Checking TypeScript compilation..."
if npm run build --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend builds successfully"
else
    echo -e "${RED}✗${NC} Backend build failed"
    ERRORS=$((ERRORS + 1))
fi

# Check 9: Git repository status
echo "📝 Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    
    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes detected"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} Not a Git repository"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Deployment possible but review recommended.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Fix issues before deploying.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) also found.${NC}"
    fi
    exit 1
fi
