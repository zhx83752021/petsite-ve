$env:PGPASSWORD = '123456'
$env:PAGER = ''

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "\d products"
