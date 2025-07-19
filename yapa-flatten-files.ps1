# File Flattening Script
# Copies all source files to a flat directory structure

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$DestinationPath = $null
)

# Get the directory where this script is located
$SourcePath = if ($PSScriptRoot) { 
    $PSScriptRoot 
}
else { 
    Split-Path -Parent $MyInvocation.MyCommand.Path 
}

# Set default destination if not provided
if (-not $DestinationPath) {
    $ParentDir = Split-Path -Parent $SourcePath
    $DestinationPath = Join-Path $ParentDir "copied-files"
}

# List of folders to EXCLUDE
$ExcludeFolders = @(
    'node_modules', 'dist', 'build', 'out', '.next', '.nuxt',
    '.git', '.svn', '.hg',
    'bin', 'obj', 'packages',
    'coverage', '.nyc_output',
    'logs',
    '.cache', '.temp', 'tmp',
    '.vscode', '.idea',
    '__pycache__', '.pytest_cache',
    'public', 'static', 'assets', 'images', 'img'
)

# File extensions to INCLUDE (only files helpful for AI code understanding)
$IncludeExtensions = @(
    # Source code files
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    '.py', '.java', '.c', '.cpp', '.cs', '.php', '.rb', '.go', '.rs',
    '.html', '.htm', '.css', '.scss', '.sass', '.less',
    '.sql', '.graphql', '.gql',
    
    # Configuration files
    '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.conf', '.config',
    '.env', '.env.example', '.env.local', '.env.development', '.env.production',
    
    # Documentation and text files
    '.md', '.txt', '.rst', '.adoc',
    
    # Build and project files
    '.dockerfile', '.gitignore', '.eslintrc', '.prettierrc',
    '.babelrc', '.npmrc', '.yarnrc',
    'package.json', 'composer.json', 'requirements.txt', 'gemfile', 'cargo.toml',
    'makefile', 'rakefile', 'gulpfile', 'gruntfile'
)

# File extensions to EXCLUDE (binary and non-helpful files)
$ExcludeExtensions = @(
    # Images and media
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico',
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
    '.mp3', '.wav', '.flac', '.aac', '.ogg',
    
    # Binary and compiled files
    '.exe', '.dll', '.so', '.dylib', '.bin', '.obj', '.o',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    
    # Temporary and log files
    '.log', '.tmp', '.cache', '.lock', '.pid', '.swp', '.bak'
)

# Initialize counters
$CopiedCount = 0
$ErrorCount = 0
$StartTime = Get-Date

Write-Host "Starting AI-Focused File Flattening Operation" -ForegroundColor Magenta
Write-Host "This will copy only files useful for AI code understanding" -ForegroundColor Yellow
Write-Host "Source: $SourcePath" -ForegroundColor Cyan
Write-Host "Destination: $DestinationPath" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor DarkGray

try {
    # Validate source path
    if (-not (Test-Path $SourcePath)) {
        throw "Source path does not exist: $SourcePath"
    }

    # Clean destination directory
    if (Test-Path $DestinationPath) {
        Write-Host "Cleaning destination directory..." -ForegroundColor Yellow
        Remove-Item -Path $DestinationPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Create destination directory
    Write-Host "Creating destination directory..." -ForegroundColor Yellow
    New-Item -Path $DestinationPath -ItemType Directory -Force | Out-Null

    # Scan for files
    Write-Host "Scanning source files..." -ForegroundColor Yellow
    $AllFiles = Get-ChildItem -Path $SourcePath -Recurse -File -Force -ErrorAction SilentlyContinue
    Write-Host "Found $($AllFiles.Count) total files to evaluate" -ForegroundColor DarkCyan

    # Filter files - only include files helpful for AI code understanding
    $FilesToCopy = @()
    foreach ($file in $AllFiles) {
        $shouldExclude = $false
        
        # First check if file extension should be excluded
        if ($ExcludeExtensions -contains $file.Extension.ToLower()) {
            $shouldExclude = $true
        }
        
        # Then check if file extension is in our include list (only if not already excluded)
        if (-not $shouldExclude) {
            $fileName = $file.Name.ToLower()
            $fileExt = $file.Extension.ToLower()
            
            # Special case for files without extensions that are important
            $importantNoExtFiles = @('dockerfile', 'makefile', 'rakefile', 'gemfile', 'gulpfile', 'gruntfile')
            $isImportantNoExt = $importantNoExtFiles | Where-Object { $fileName -like "*$_*" }
            
            # Include file if extension is in include list OR it's an important file without extension
            if (-not ($IncludeExtensions -contains $fileExt -or $isImportantNoExt)) {
                $shouldExclude = $true
            }
        }
        
        # Check if file is in excluded folder
        if (-not $shouldExclude) {
            $relativePath = $file.FullName.Substring($SourcePath.Length + 1)
            foreach ($folder in $ExcludeFolders) {
                if ($relativePath -like "*$folder*") {
                    $shouldExclude = $true
                    break
                }
            }
        }
        
        if (-not $shouldExclude) {
            $FilesToCopy += $file
        }
    }

    $totalFiles = $FilesToCopy.Count
    Write-Host "Selected $totalFiles files for copying" -ForegroundColor Green

    if ($totalFiles -eq 0) {
        Write-Warning "No files found to copy."
        return
    }

    # Copy files
    Write-Host "Starting file copy operation..." -ForegroundColor Yellow
    $nameTracker = @{}

    foreach ($file in $FilesToCopy) {
        try {
            # Generate unique filename
            $baseName = $file.Name
            $targetFile = Join-Path $DestinationPath $baseName

            # Handle duplicates
            if ($nameTracker.ContainsKey($baseName.ToLower())) {
                $nameTracker[$baseName.ToLower()]++
                $counter = $nameTracker[$baseName.ToLower()]
                $nameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                $extension = $file.Extension
                $baseName = "$nameNoExt`_$counter$extension"
                $targetFile = Join-Path $DestinationPath $baseName
            }
            else {
                $nameTracker[$baseName.ToLower()] = 1
            }

            # Copy file
            Copy-Item -Path $file.FullName -Destination $targetFile -Force
            $CopiedCount++

            # Show progress every 50 files
            if ($CopiedCount % 50 -eq 0 -or $CopiedCount -eq $totalFiles) {
                $percent = [Math]::Round(($CopiedCount / $totalFiles) * 100, 1)
                Write-Host "Progress: $CopiedCount/$totalFiles files ($percent percent)" -ForegroundColor Cyan
            }
        }
        catch {
            $ErrorCount++
            Write-Warning "Failed to copy '$($file.Name)': $($_.Exception.Message)"
        }
    }

    # Final report
    $endTime = Get-Date
    $duration = $endTime - $StartTime

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor DarkGray
    Write-Host "File Flattening Operation Completed!" -ForegroundColor Green
    Write-Host "SUMMARY:" -ForegroundColor White
    Write-Host "Successfully copied: $CopiedCount files" -ForegroundColor Green
    Write-Host "Skipped (excluded): $($AllFiles.Count - $totalFiles) files" -ForegroundColor Yellow

    if ($ErrorCount -gt 0) {
        Write-Host "Errors encountered: $ErrorCount files" -ForegroundColor Red
    }

    Write-Host "Total duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Cyan
    Write-Host "Destination: $DestinationPath" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor DarkGray

    if ($ErrorCount -gt 0) {
        Write-Host "Operation completed with errors." -ForegroundColor Yellow
    }
    else {
        Write-Host "Operation completed successfully!" -ForegroundColor Green
    }
}
catch {
    Write-Error "Fatal error: $($_.Exception.Message)"
}

Write-Host "Script execution completed." -ForegroundColor Green