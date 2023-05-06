# Define the connection to the database
$serverName = "nsinb-33\SQLEXPRESS"
$databaseName = "ford"
$tableName = "dbo.Alkatreszek"
$connectionString = "Server=$serverName;Database=$databaseName;Integrated Security=True;"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()
$logFile = "create_Kepek_in_DB.log"
$logPath = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) -ChildPath $logFile

# Check if the connection is open and log the result
if ($connection.State -eq 'Open') {
    $connectionLog = "Connection to database $databaseName on server $serverName successful.`r`n"
    Add-Content -Path $logPath -Value $connectionLog
} else {
    $connectionLog = "Connection to database $databaseName on server $serverName failed.`r`n"
    Add-Content -Path $logPath -Value $connectionLog
}

# Method to log errors
function Log-Error($errorMessage) {
    $errorLog = "ERROR: $errorMessage`r`n"
    Add-Content -Path $logPath -Value $errorLog
}

# Supported image file extensions
$imageExtensions = @('jpg', 'jpeg', 'png', 'gif')

# Get the current folder path and list of files to process
$folderPath = $PSScriptRoot
Write-Host "Folder path: $folderPath"
$fileName = ($folderPath -split '\\')[-1]
Write-Host "Looking for files with extensions: $($imageExtensions -join ",")"
$files = Get-ChildItem -Path "C:\Users\marschallg\Desktop\FORD\Rework\bonto\wwwroot\images" -Recurse
Write-Host "Found $($files.Count) files"
$files | ForEach-Object { Write-Host $_.FullName }

# Loop through each file and insert into the database
Write-Host "Processing files:"
foreach ($file in $files) {
    $fileName = $file.Name.Split('.')[0]
    Write-Host "Processing file: $($file.FullName)"

    # Get the next file name with "_n" suffix
    $nextFileName = $files | Where-Object { $_.Name -like "$fileName`*_*$($_.Extension)" } | Sort-Object { [int]($_.Name -replace "$fileName`*_", '') } | Select-Object -First 1
    if ($nextFileName -ne $null) {
        $nextFileName = $nextFileName.Name.Split('.')[0]
        $separator = ';'
    } else {
        $separator = ''
    }

    # Update the [Kepek] column in the database
    $query = "UPDATE dbo.Alkatreszek SET Kepek = CONCAT(Kepek, '$fileName$separator$nextFileName$($file.Extension);')
                WHERE Nev = '$fileName'"

    Write-Host "Query: $query"
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)

    # Try to execute the SQL query and log any errors
    try {
        $result = $command.ExecuteNonQuery()
        $logEntry = "$query : $result`r`n"
        Add-Content -Path $logPath -Value $logEntry
    } catch {
        Log-Error $_.Exception.Message
    }
}

# Close the database connection
$connection.Close()

# Log the script
$completionTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$completionLog = "Script completed at $completionTime`r`n"
Add-Content -Path $logPath -Value $completionLog