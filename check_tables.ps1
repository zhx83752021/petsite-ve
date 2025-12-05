$env:PGPASSWORD = '123456'
$env:PAGER = ''

Write-Host "=== Checking brands table structure ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "\d brands"

Write-Host "`n=== Checking products table structure ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "\d products"

Write-Host "`n=== Checking product_skus table structure ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "\d product_skus"
