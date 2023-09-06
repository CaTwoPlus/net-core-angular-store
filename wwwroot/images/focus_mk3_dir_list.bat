@echo off
set dirpath=%1
dir %dirpath% /-p /o:gn > "%dirpath%\DirContents.txt"
exit