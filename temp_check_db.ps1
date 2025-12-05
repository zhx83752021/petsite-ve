$env:PGPASSWORD='123456'
$env:PAGER=''
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d pet_web -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
