import subprocess

# Configurações do PostgreSQL
db_user = "postgres"
db_name = "bytepay"
host = "localhost"
port = "5432"
output_file = "bytepay_backup.sql"

try:
    # Comando para exportar o banco de dados
    command = [
        "pg_dump",
        "-U", db_user,
        "-h", host,
        "-p", port,
        "-F", "c",  # Formato customizado (ou mude para 'p' para SQL puro)
        "-d", db_name,
        "-f", output_file
    ]
    # Executa o comando
    subprocess.run(command, check=True)
    print(f"Backup completo do banco {db_name} salvo em {output_file}.")
except Exception as e:
    print(f"Erro ao exportar o banco de dados: {e}")
