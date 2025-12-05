$env:PGPASSWORD = '123456'
$env:PAGER = ''

Write-Host "=== 开始初始化数据库 ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -f "d:\site4\backend\scripts\init-database.sql"

Write-Host "`n=== 初始化完成，验证数据 ===" -ForegroundColor Green
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as admins FROM admins;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as categories FROM categories;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT COUNT(*) as brands FROM brands;"
