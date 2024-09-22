# Wiki
## 数据备份

```bash
cat /root/mysql/backup_2024-09-19_15:24:14.sql | docker-compose exec -T mysql mysql -u admin -p<PASSWORD> web-tags
```

```bash
# 打开 crontab 文件
crontab -e

# 添加定期备份任务，每天凌晨 1 点运行备份脚本
0 1 * * * /root/mysql/backup.sh
```