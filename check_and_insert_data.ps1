$env:PGPASSWORD = '123456'
$env:PAGER = ''

Write-Host "=== 检查数据库表 ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as admins FROM admins;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as categories FROM categories;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as brands FROM brands;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as products FROM products;"
