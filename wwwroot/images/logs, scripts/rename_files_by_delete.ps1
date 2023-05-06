$folderPath = Get-Location

Get-ChildItem -Path $folderPath -Recurse -File | ForEach-Object {
    $newName = $_.Name -replace "FOCUS ", ""
    if($newName -ne $_.Name){
        Rename-Item -Path $_.FullName -NewName $newName -WhatIf
    }
}
