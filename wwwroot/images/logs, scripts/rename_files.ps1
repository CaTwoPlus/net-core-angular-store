$folderPath = Get-Location

Get-ChildItem -Path $folderPath -Recurse -File | ForEach-Object {
    $newName = $_.Name -replace ',', ', '
    if ($_.Name -ne $newName) {
        Rename-Item $_.FullName -NewName $newName
	}
}
