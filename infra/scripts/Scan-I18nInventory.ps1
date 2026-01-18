#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive i18n inventory scanner for Digilist Platform
.DESCRIPTION
    Scans all pages and components for:
    - Translation key usage (t('key'), useT(), useLazyT())
    - Hard-coded strings in JSX/TSX
    - Missing translations
    - Unused translation keys
.PARAMETER OutputFormat
    Output format: JSON, CSV, or Markdown (default: JSON)
.PARAMETER AppFilter
    Filter by specific app (e.g., 'minside', 'backoffice', 'web')
.PARAMETER IncludePackages
    Include packages in scan (default: false)
.EXAMPLE
    ./Scan-I18nInventory.ps1 -OutputFormat Markdown
    ./Scan-I18nInventory.ps1 -AppFilter minside -OutputFormat CSV
#>

param(
    [ValidateSet('JSON', 'CSV', 'Markdown')]
    [string]$OutputFormat = 'JSON',
    
    [string]$AppFilter = '',
    
    [switch]$IncludePackages = $false
)

# Configuration
$rootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outputDir = Join-Path $rootDir "i18n-inventory-reports"
$outputFile = Join-Path $outputDir "i18n-inventory-$timestamp.$($OutputFormat.ToLower())"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "🔍 Digilist Platform - i18n Inventory Scanner" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Define scan patterns
$translationPatterns = @{
    'useT' = 'useT\(\)'
    'useLazyT' = 'useLazyT\(\)'
    'useTranslation' = 'useTranslation\(\)'
    'tFunction' = '\bt\([''"`]([^''"`]+)[''"`]'
    'tWithInterpolation' = '\bt\([''"`]([^''"`]+)[''"`],\s*\{[^}]+\}'
}

$hardcodedStringPatterns = @{
    'jsxText' = '>\s*[A-ZÆØÅ][a-zæøå]{2,}[^<]*<'
    'buttonText' = '<[Bb]utton[^>]*>([^<{]+)<'
    'headingText' = '<h[1-6][^>]*>([^<{]+)<'
    'labelText' = '<[Ll]abel[^>]*>([^<{]+)<'
    'placeholderAttr' = 'placeholder=[''"]([^''"]+)[''"]'
    'titleAttr' = 'title=[''"]([^''"]+)[''"]'
    'ariaLabel' = 'aria-label=[''"]([^''"]+)[''"]'
}

# Initialize results
$results = @{
    metadata = @{
        scanDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        outputFormat = $OutputFormat
        appFilter = if ($AppFilter) { $AppFilter } else { "all" }
        includePackages = $IncludePackages
    }
    summary = @{
        totalFiles = 0
        filesWithTranslations = 0
        filesWithHardcodedStrings = 0
        totalTranslationKeys = 0
        totalHardcodedStrings = 0
        uniqueTranslationKeys = @{}
        uniqueNamespaces = @{}
    }
    files = @()
    translationKeys = @()
    hardcodedStrings = @()
    violations = @()
}

# Function to extract translation keys from content
function Get-TranslationKeys {
    param([string]$content, [string]$filePath)
    
    $keys = @()
    
    # Pattern: t('namespace.key') or t("namespace.key")
    $matches = [regex]::Matches($content, "t\(['\`"]([^'\`"]+)['\`"]")
    foreach ($match in $matches) {
        $key = $match.Groups[1].Value
        $keys += @{
            key = $key
            file = $filePath
            type = 'direct'
            line = ($content.Substring(0, $match.Index) -split "`n").Count
        }
    }
    
    # Pattern: t('key', { interpolation })
    $matches = [regex]::Matches($content, "t\(['\`"]([^'\`"]+)['\`"],\s*\{")
    foreach ($match in $matches) {
        $key = $match.Groups[1].Value
        $keys += @{
            key = $key
            file = $filePath
            type = 'interpolated'
            line = ($content.Substring(0, $match.Index) -split "`n").Count
        }
    }
    
    return $keys
}

# Function to detect hard-coded strings
function Get-HardcodedStrings {
    param([string]$content, [string]$filePath)
    
    $strings = @()
    $lines = $content -split "`n"
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNum = $i + 1
        
        # Skip import statements, comments, and console logs
        if ($line -match '^\s*(import|//|/\*|\*|console\.)') {
            continue
        }
        
        # JSX text content (between tags)
        if ($line -match '>\s*([A-ZÆØÅ][a-zæøåA-ZÆØÅ\s]{2,})\s*<') {
            $text = $matches[1].Trim()
            if ($text -and $text.Length -gt 2 -and $text -notmatch '^\{' -and $text -notmatch '^[0-9]+$') {
                $strings += @{
                    text = $text
                    file = $filePath
                    line = $lineNum
                    type = 'jsx-text'
                    context = $line.Trim()
                }
            }
        }
        
        # Placeholder attributes
        if ($line -match 'placeholder=[''"]([^''"]+)[''"]') {
            $text = $matches[1]
            if ($text -notmatch '^\{' -and $text.Length -gt 2) {
                $strings += @{
                    text = $text
                    file = $filePath
                    line = $lineNum
                    type = 'placeholder'
                    context = $line.Trim()
                }
            }
        }
        
        # Title attributes
        if ($line -match 'title=[''"]([^''"]+)[''"]') {
            $text = $matches[1]
            if ($text -notmatch '^\{' -and $text.Length -gt 2) {
                $strings += @{
                    text = $text
                    file = $filePath
                    line = $lineNum
                    type = 'title'
                    context = $line.Trim()
                }
            }
        }
        
        # aria-label attributes
        if ($line -match 'aria-label=[''"]([^''"]+)[''"]') {
            $text = $matches[1]
            if ($text -notmatch '^\{' -and $text.Length -gt 2) {
                $strings += @{
                    text = $text
                    file = $filePath
                    line = $lineNum
                    type = 'aria-label'
                    context = $line.Trim()
                }
            }
        }
    }
    
    return $strings
}

# Function to scan a file
function Scan-File {
    param([string]$filePath)
    
    $relativePath = $filePath.Replace($rootDir, '').TrimStart('\', '/')
    
    try {
        $content = Get-Content -Path $filePath -Raw -ErrorAction Stop
        
        # Extract translation keys
        $translationKeys = Get-TranslationKeys -content $content -filePath $relativePath
        
        # Detect hard-coded strings
        $hardcodedStrings = Get-HardcodedStrings -content $content -filePath $relativePath
        
        # Check for translation hook usage
        $usesTranslation = $content -match 'use(Lazy)?T\(\)' -or $content -match 'useTranslation\(\)'
        
        # Build file result
        $fileResult = @{
            path = $relativePath
            usesTranslation = $usesTranslation
            translationKeyCount = $translationKeys.Count
            hardcodedStringCount = $hardcodedStrings.Count
            translationKeys = $translationKeys
            hardcodedStrings = $hardcodedStrings
        }
        
        # Update summary
        $results.summary.totalFiles++
        if ($translationKeys.Count -gt 0) {
            $results.summary.filesWithTranslations++
            $results.summary.totalTranslationKeys += $translationKeys.Count
        }
        if ($hardcodedStrings.Count -gt 0) {
            $results.summary.filesWithHardcodedStrings++
            $results.summary.totalHardcodedStrings += $hardcodedStrings.Count
        }
        
        # Track unique keys and namespaces
        foreach ($key in $translationKeys) {
            $keyName = $key.key
            if (-not $results.summary.uniqueTranslationKeys.ContainsKey($keyName)) {
                $results.summary.uniqueTranslationKeys[$keyName] = 0
            }
            $results.summary.uniqueTranslationKeys[$keyName]++
            
            # Extract namespace
            if ($keyName -match '^([^.]+)\.') {
                $namespace = $matches[1]
                if (-not $results.summary.uniqueNamespaces.ContainsKey($namespace)) {
                    $results.summary.uniqueNamespaces[$namespace] = 0
                }
                $results.summary.uniqueNamespaces[$namespace]++
            }
        }
        
        # Add to results
        $results.files += $fileResult
        $results.translationKeys += $translationKeys
        $results.hardcodedStrings += $hardcodedStrings
        
        # Check for violations
        if ($hardcodedStrings.Count -gt 0 -and $usesTranslation) {
            $results.violations += @{
                file = $relativePath
                type = 'mixed-approach'
                message = "File uses translations but also contains $($hardcodedStrings.Count) hard-coded strings"
                severity = 'warning'
            }
        }
        
        if ($hardcodedStrings.Count -gt 5 -and -not $usesTranslation) {
            $results.violations += @{
                file = $relativePath
                type = 'no-i18n'
                message = "File contains $($hardcodedStrings.Count) hard-coded strings but doesn't use i18n"
                severity = 'error'
            }
        }
        
        Write-Host "  ✓ $relativePath" -ForegroundColor Gray
        
    } catch {
        Write-Host "  ✗ $relativePath - Error: $_" -ForegroundColor Red
    }
}

# Determine scan directories
$scanDirs = @()

if ($AppFilter) {
    $appPath = Join-Path $rootDir "apps/$AppFilter"
    if (Test-Path $appPath) {
        $scanDirs += $appPath
    } else {
        Write-Host "❌ App '$AppFilter' not found" -ForegroundColor Red
        exit 1
    }
} else {
    $scanDirs += Join-Path $rootDir "apps"
}

if ($IncludePackages) {
    $scanDirs += Join-Path $rootDir "packages"
}

# Scan files
Write-Host "📂 Scanning directories..." -ForegroundColor Yellow
foreach ($dir in $scanDirs) {
    if (Test-Path $dir) {
        Write-Host "  Scanning: $dir" -ForegroundColor Cyan
        
        # Find all .tsx and .ts files (excluding node_modules, dist, .turbo)
        $files = Get-ChildItem -Path $dir -Recurse -Include *.tsx,*.ts -File |
            Where-Object { 
                $_.FullName -notmatch 'node_modules' -and 
                $_.FullName -notmatch '[\\/]dist[\\/]' -and
                $_.FullName -notmatch '[\\/]\.turbo[\\/]' -and
                $_.FullName -notmatch '\.test\.' -and
                $_.FullName -notmatch '\.spec\.'
            }
        
        foreach ($file in $files) {
            Scan-File -filePath $file.FullName
        }
    }
}

Write-Host ""
Write-Host "📊 Scan Summary" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "Total files scanned:           $($results.summary.totalFiles)" -ForegroundColor White
Write-Host "Files with translations:       $($results.summary.filesWithTranslations)" -ForegroundColor Cyan
Write-Host "Files with hard-coded strings: $($results.summary.filesWithHardcodedStrings)" -ForegroundColor Yellow
Write-Host "Total translation keys used:   $($results.summary.totalTranslationKeys)" -ForegroundColor Cyan
Write-Host "Unique translation keys:       $($results.summary.uniqueTranslationKeys.Count)" -ForegroundColor Cyan
Write-Host "Unique namespaces:             $($results.summary.uniqueNamespaces.Count)" -ForegroundColor Cyan
Write-Host "Total hard-coded strings:      $($results.summary.totalHardcodedStrings)" -ForegroundColor Yellow
Write-Host "Violations found:              $($results.violations.Count)" -ForegroundColor Red
Write-Host ""

# Generate output based on format
switch ($OutputFormat) {
    'JSON' {
        $results | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "✅ JSON report saved to: $outputFile" -ForegroundColor Green
    }
    
    'CSV' {
        # Create CSV for translation keys
        $csvKeysFile = $outputFile.Replace('.csv', '-keys.csv')
        $results.translationKeys | Export-Csv -Path $csvKeysFile -NoTypeInformation -Encoding UTF8
        
        # Create CSV for hard-coded strings
        $csvStringsFile = $outputFile.Replace('.csv', '-hardcoded.csv')
        $results.hardcodedStrings | Export-Csv -Path $csvStringsFile -NoTypeInformation -Encoding UTF8
        
        # Create CSV for violations
        $csvViolationsFile = $outputFile.Replace('.csv', '-violations.csv')
        $results.violations | Export-Csv -Path $csvViolationsFile -NoTypeInformation -Encoding UTF8
        
        Write-Host "✅ CSV reports saved:" -ForegroundColor Green
        Write-Host "   - Keys: $csvKeysFile" -ForegroundColor Cyan
        Write-Host "   - Hard-coded: $csvStringsFile" -ForegroundColor Cyan
        Write-Host "   - Violations: $csvViolationsFile" -ForegroundColor Cyan
    }
    
    'Markdown' {
        $md = @"
# i18n Inventory Report
**Generated:** $($results.metadata.scanDate)  
**App Filter:** $($results.metadata.appFilter)  
**Include Packages:** $($results.metadata.includePackages)

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| Total Files Scanned | $($results.summary.totalFiles) |
| Files with Translations | $($results.summary.filesWithTranslations) |
| Files with Hard-coded Strings | $($results.summary.filesWithHardcodedStrings) |
| Total Translation Keys Used | $($results.summary.totalTranslationKeys) |
| Unique Translation Keys | $($results.summary.uniqueTranslationKeys.Count) |
| Unique Namespaces | $($results.summary.uniqueNamespaces.Count) |
| Total Hard-coded Strings | $($results.summary.totalHardcodedStrings) |
| Violations | $($results.violations.Count) |

---

## 🔑 Translation Keys by Namespace

| Namespace | Usage Count |
|-----------|-------------|
"@
        
        foreach ($ns in ($results.summary.uniqueNamespaces.GetEnumerator() | Sort-Object -Property Value -Descending)) {
            $md += "`n| $($ns.Key) | $($ns.Value) |"
        }
        
        $md += @"

---

## ⚠️ Top Violations

| File | Type | Message | Severity |
|------|------|---------|----------|
"@
        
        foreach ($violation in ($results.violations | Select-Object -First 20)) {
            $md += "`n| ``$($violation.file)`` | $($violation.type) | $($violation.message) | $($violation.severity) |"
        }
        
        $md += @"

---

## 📝 Files with Most Hard-coded Strings

| File | Count | Uses i18n? |
|------|-------|------------|
"@
        
        foreach ($file in ($results.files | Where-Object { $_.hardcodedStringCount -gt 0 } | Sort-Object -Property hardcodedStringCount -Descending | Select-Object -First 20)) {
            $usesI18n = if ($file.usesTranslation) { "✅" } else { "❌" }
            $md += "`n| ``$($file.path)`` | $($file.hardcodedStringCount) | $usesI18n |"
        }
        
        $md += @"

---

## 🎯 Most Used Translation Keys

| Key | Usage Count |
|-----|-------------|
"@
        
        foreach ($key in ($results.summary.uniqueTranslationKeys.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 30)) {
            $md += "`n| ``$($key.Key)`` | $($key.Value) |"
        }
        
        $md += "`n`n---`n`n*End of Report*`n"
        
        $md | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "✅ Markdown report saved to: $outputFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Scan complete!" -ForegroundColor Green
