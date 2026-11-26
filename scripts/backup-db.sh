#!/usr/bin/env bash
# backup-db.sh — Backup database Dinas Academy (dijalankan di server, dari folder proyek).
#
#   bash scripts/backup-db.sh
#
# Otomatis tiap hari jam 02.00 (crontab -e, lalu tambahkan baris):
#   0 2 * * * cd /opt/dinasacademy && bash scripts/backup-db.sh >> backups/backup.log 2>&1
#
# Hasil: backups/dinasacademy-YYYYMMDD-HHMM.dump  (disimpan 14 hari terakhir)
# Restore: docker exec -i dinasacademy-db pg_restore -U postgres -d dinasacademy --clean --if-exists --no-owner < FILE.dump
set -euo pipefail
cd "$(dirname "$0")/.."

# Ambil nama user & database dari .env (default postgres / dinasacademy)
DB_USERNAME=$(grep -E '^DB_USERNAME=' .env | cut -d= -f2- || true); DB_USERNAME=${DB_USERNAME:-postgres}
DB_NAME=$(grep -E '^DB_NAME=' .env | cut -d= -f2- || true); DB_NAME=${DB_NAME:-dinasacademy}

mkdir -p backups
FILE="backups/${DB_NAME}-$(date +%Y%m%d-%H%M).dump"
docker exec dinasacademy-db pg_dump -U "$DB_USERNAME" -d "$DB_NAME" -Fc > "$FILE"
echo "$(date '+%F %T') backup OK: $FILE ($(du -h "$FILE" | cut -f1))"

# Hapus backup lebih dari 14 hari
find backups -name "${DB_NAME}-*.dump" -mtime +14 -delete
