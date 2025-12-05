$env:PGPASSWORD = '123456'
$env:PAGER = ''
$env:PGCLIENTENCODING = 'UTF8'

Write-Host "Inserting products..." -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -f "d:\site4\insert_data.sql"

Write-Host "`nChecking results..." -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) FROM products;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT id, name, price, sales FROM products LIMIT 5;"

Write-Host "`nDone!" -ForegroundColor Green
