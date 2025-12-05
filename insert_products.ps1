$env:PGPASSWORD = '123456'
$env:PAGER = ''
$env:PGCLIENTENCODING = 'UTF8'

Write-Host "=== Inserting sample product data ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -f "d:\site4\backend\scripts\insert-sample-products.sql"

Write-Host "`n=== Verifying data ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as products FROM products;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as skus FROM product_skus;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT name, sales FROM products ORDER BY sales DESC LIMIT 5;"
