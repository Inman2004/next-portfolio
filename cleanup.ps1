# Remove conflicting route directories
Remove-Item -Recurse -Force "app/api/users/[id]"
Remove-Item -Recurse -Force "app/api/users/[userId]"

Write-Host "Cleanup complete. Removed conflicting route directories."
