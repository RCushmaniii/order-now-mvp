# Project Structure Generator for AI Analysis
# Generates a filtered project structure showing only AI-relevant files

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = "C:\Users\Robert Cushman\.vscode\Projects\order-now-mvp",
    
    [Parameter(Mandatory = $false)]
    [string]$OutputFolder = "C:\Users\Robert Cushman\.vscode\Projects\copied-structure",
    
    [Parameter(Mandatory = $false)]
    [int]$MaxDepth = 5
)

# List of folders to EXCLUDE from structure
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
    '.babelrc', '.npmrc', '.yarnrc'
)

# File extensions to EXCLUDE
$ExcludeExtensions = @(
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico',
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
    '.mp3', '.wav', '.flac', '.aac', '.ogg',
    '.exe', '.dll', '.so', '.dylib', '.bin', '.obj', '.o',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.log', '.tmp', '.cache', '.lock', '.pid', '.swp', '.bak'
)

# Important files without extensions
$ImportantFiles = @('dockerfile', 'makefile', 'rakefile', 'gemfile', 'gulpfile', 'gruntfile', 'readme', 'license', 'changelog')

# Function to check if a file should be included
function Test-ShouldIncludeFile {
    param([System.IO.FileInfo]$File)
    
    # Check if file extension should be excluded
    if ($ExcludeExtensions -contains $File.Extension.ToLower()) {
        return $false
    }
    
    $fileName = $File.Name.ToLower()
    $fileExt = $File.Extension.ToLower()
    
    # Check if it's an important file without extension
    $isImportant = $false
    foreach ($important in $ImportantFiles) {
        if ($fileName -like "*$important*") {
            $isImportant = $true
            break
        }
    }
    
    # Include if extension is in include list OR it's an important file
    return ($IncludeExtensions -contains $fileExt -or $isImportant)
}

# Function to check if a folder should be excluded
function Test-ShouldExcludeFolder {
    param([string]$FolderName)
    
    foreach ($folder in $ExcludeFolders) {
        if ($FolderName -like "*$folder*") {
            return $true
        }
    }
    return $false
}

# Function to write project structure recursively
function Write-ProjectStructure {
    param (
        [string]$Path,
        [int]$Level = 0,
        [System.IO.StreamWriter]$Writer,
        [int]$MaxDepth = 5
    )
    
    # Stop if we've reached max depth
    if ($Level -gt $MaxDepth) {
        return
    }
    
    # Create indentation using spaces to avoid encoding issues
    $Prefix = '    ' * $Level
    
    try {
        $Items = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Sort-Object { -not $_.PSIsContainer }, Name
    }
    catch {
        return
    }
    
    # Filter items
    $FilteredItems = @()
    foreach ($Item in $Items) {
        if ($Item.PSIsContainer) {
            # Include folder if not in exclude list
            if (-not (Test-ShouldExcludeFolder -FolderName $Item.Name)) {
                $FilteredItems += $Item
            }
        }
        else {
            # Include file if it matches our criteria
            if (Test-ShouldIncludeFile -File $Item) {
                $FilteredItems += $Item
            }
        }
    }
    
    $itemCount = $FilteredItems.Count
    for ($i = 0; $i -lt $itemCount; $i++) {
        $Item = $FilteredItems[$i]
        $IsLast = ($i -eq ($itemCount - 1))
        
        # Use simple ASCII characters for tree structure
        if ($IsLast) {
            $LinePrefix = $Prefix + '+-- '
        }
        else {
            $LinePrefix = $Prefix + '|-- '
        }
        
        if ($Item.PSIsContainer) {
            $Writer.WriteLine("$LinePrefix$($Item.Name)/")
            Write-ProjectStructure -Path $Item.FullName -Level ($Level + 1) -Writer $Writer -MaxDepth $MaxDepth
        }
        else {
            $Writer.WriteLine("$LinePrefix$($Item.Name)")
        }
    }
}

# Main execution
Write-Host "Generating Project Structure for AI Analysis" -ForegroundColor Magenta
Write-Host "Project: $ProjectPath" -ForegroundColor Cyan
Write-Host "Output: $OutputFolder" -ForegroundColor Cyan

try {
    # Validate project path
    if (-not (Test-Path $ProjectPath)) {
        throw "Project path does not exist: $ProjectPath"
    }
    
    # Create output folder if it doesn't exist
    if (-not (Test-Path $OutputFolder)) {
        Write-Host "Creating output folder..." -ForegroundColor Yellow
        New-Item -Path $OutputFolder -ItemType Directory -Force | Out-Null
    }
    
    # Generate filename with date
    $Date = Get-Date -Format "yyyy-MM-dd"
    $ProjectName = Split-Path -Leaf $ProjectPath
    $FileName = "project-structure-$ProjectName-$Date.txt"
    $ReportPath = Join-Path $OutputFolder $FileName
    
    Write-Host "Analyzing project structure..." -ForegroundColor Yellow
    
    # Count files for summary
    $AllFiles = Get-ChildItem -Path $ProjectPath -Recurse -File -Force -ErrorAction SilentlyContinue
    $RelevantFiles = 0
    foreach ($file in $AllFiles) {
        $relativePath = $file.FullName.Substring($ProjectPath.Length + 1)
        $inExcludedFolder = $false
        foreach ($folder in $ExcludeFolders) {
            if ($relativePath -like "*$folder*") {
                $inExcludedFolder = $true
                break
            }
        }
        
        if (-not $inExcludedFolder -and (Test-ShouldIncludeFile -File $file)) {
            $RelevantFiles++
        }
    }
    
    # Create the structure file
    Write-Host "Writing structure file..." -ForegroundColor Yellow
    $Writer = New-Object System.IO.StreamWriter($ReportPath, $false, [System.Text.Encoding]::UTF8)
    
    $Writer.WriteLine("Project Structure for AI Analysis")
    $Writer.WriteLine("=" * 50)
    $Writer.WriteLine("Project: $ProjectPath")
    $Writer.WriteLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    $Writer.WriteLine("Max Depth: $MaxDepth levels")
    $Writer.WriteLine("")
    $Writer.WriteLine("Purpose: Shows only files useful for AI code understanding")
    $Writer.WriteLine("")
    $Writer.WriteLine("Legend:")
    $Writer.WriteLine("|-- File or folder")
    $Writer.WriteLine("+-- Last item in directory")
    $Writer.WriteLine("folder/ - Directory")
    $Writer.WriteLine("")
    $Writer.WriteLine("Includes:")
    $Writer.WriteLine("- Source code files (.js, .ts, .py, .html, .css, etc.)")
    $Writer.WriteLine("- Configuration files (.json, .env, .gitignore, etc.)")
    $Writer.WriteLine("- Documentation files (.md, .txt, etc.)")
    $Writer.WriteLine("- Build files (Dockerfile, Makefile, etc.)")
    $Writer.WriteLine("")
    $Writer.WriteLine("Excludes:")
    $Writer.WriteLine("- Images and media files")
    $Writer.WriteLine("- Binary and compiled files")
    $Writer.WriteLine("- Build artifacts (node_modules, dist, build, etc.)")
    $Writer.WriteLine("- Temporary and log files")
    $Writer.WriteLine("")
    $Writer.WriteLine("Project Structure:")
    $Writer.WriteLine("")
    
    # Write the actual structure
    $rootName = Split-Path -Leaf $ProjectPath
    $Writer.WriteLine("$rootName/")
    Write-ProjectStructure -Path $ProjectPath -Writer $Writer -MaxDepth $MaxDepth
    
    # Add summary
    $Writer.WriteLine("")
    $Writer.WriteLine("Summary:")
    $Writer.WriteLine("- Total files in project: $($AllFiles.Count)")
    $Writer.WriteLine("- AI-relevant files shown: $RelevantFiles")
    $Writer.WriteLine("- Files excluded: $($AllFiles.Count - $RelevantFiles)")
    $Writer.WriteLine("- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    
    $Writer.Close()
    
    Write-Host ""
    Write-Host "Project structure generated successfully!" -ForegroundColor Green
    Write-Host "File saved to: $ReportPath" -ForegroundColor Cyan
    Write-Host "AI-relevant files: $RelevantFiles of $($AllFiles.Count) total files" -ForegroundColor Yellow
}
catch {
    Write-Error "Error generating project structure: $($_.Exception.Message)"
}

Write-Host "Done!" -ForegroundColor Green