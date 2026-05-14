# ClassSync 本地 Docker 部署指南

## 概述

本指南介绍如何在本地环境中使用 Docker 和 Docker Compose 部署 ClassSync 笔记应用。

## 系统要求

- Docker Engine 20.10 或更高版本
- Docker Compose v2 或更高版本
- 至少 4GB 可用内存
- 至少 5GB 可用磁盘空间

## 部署步骤

### 1. 克隆项目

```bash
git clone <your-repository-url>
cd note-taker
```

### 2. 构建并启动服务

使用提供的部署脚本：

```bash
# 构建并启动所有服务
./docker-deploy.sh --build

# 或者分别执行
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 手动部署方式

如果您不使用脚本，也可以手动部署：

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务（后台运行）
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 服务配置

### 服务列表

| 服务名称 | 端口 | 描述 |
|---------|------|------|
| api | 8000 | 主要的 FastAPI 应用服务 |
| db | 5432 | PostgreSQL 数据库 |
| redis | 6379 | Redis 缓存和任务队列 |
| worker | - | Celery 异步任务处理 |
| flower | 5555 | Celery 任务监控面板 |

### 环境变量

所有服务使用以下环境变量：

- `DATABASE_URL`: PostgreSQL 连接字符串
- `REDIS_URL`: Redis 连接字符串
- `CELERY_BROKER_URL`: Celery 消息代理
- `CELERY_RESULT_BACKEND`: Celery 结果后端
- `SECRET_KEY`: JWT 密钥
- `LOCAL_AI_BASE_URL`: 本地 AI 模型接口
- `LOCAL_AI_API_KEY`: 本地 AI 模型密钥
- `LOCAL_AI_MODEL`: 本地 AI 模型名称

## 访问应用

部署完成后，您可以通过以下地址访问服务：

- **API 接口**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/api/v1/health
- **任务监控**: http://localhost:5555 (用户名: admin, 密码: flowerpassword)
- **数据库**: localhost:5432
- **Redis**: localhost:6379

## 常用命令

### 启动/停止服务

```bash
# 启动所有服务
./docker-deploy.sh --up

# 停止所有服务
./docker-deploy.sh --down

# 重启服务
./docker-deploy.sh --restart
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f worker
```

### 管理数据

```bash
# 查看数据卷
docker volume ls | grep classsync

# 备份数据库
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres note_taker > backup.sql

# 进入容器
docker-compose -f docker-compose.prod.yml exec api sh
docker-compose -f docker-compose.prod.yml exec db psql -U postgres
```

## 故障排除

### 服务无法启动

1. 检查 Docker 是否正在运行
2. 检查端口是否被占用
3. 查看详细日志：
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=50 api
   ```

### 数据库连接问题

1. 确认数据库服务正在运行：
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```
2. 检查网络连接：
   ```bash
   docker-compose -f docker-compose.prod.yml exec api ping db
   ```

### 构建失败

1. 清理构建缓存：
   ```bash
   docker builder prune -a
   ```
2. 重新构建：
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

## 性能调优

### 资源限制

在 `docker-compose.prod.yml` 中调整服务资源限制：

```yaml
services:
  api:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 扩展服务

增加 API 服务副本数：

```bash
docker-compose -f docker-compose.prod.yml up -d --scale api=2
```

## 安全注意事项

1. **生产环境**：在生产环境中，请务必更改默认密码和密钥
2. **网络隔离**：确保数据库和 Redis 仅在内部网络中可访问
3. **备份策略**：定期备份数据库和重要数据
4. **监控日志**：监控应用日志以检测异常活动

## 卸载

停止并移除所有服务和数据：

```bash
# 停止服务
./docker-deploy.sh --down

# 删除数据卷（警告：这会删除所有数据）
docker volume rm note-taker_postgres_data note-taker_redis_data

# 删除镜像（可选）
docker rmi classsync/api:latest
```

## 自定义配置

您可以根据需要修改 `docker-compose.prod.yml` 文件：

1. 更改端口映射
2. 调整环境变量
3. 修改资源限制
4. 添加自定义卷或网络

## 更新应用

当有新版本时：

```bash
# 获取最新代码
git pull origin main

# 重建镜像并重启服务
./docker-deploy.sh --build --restart
```

## 总结

本部署方案提供了完整的本地 Docker 部署能力，包括所有必要的服务和监控工具。通过使用 Docker Compose，您可以轻松地在本地环境中运行完整的 ClassSync 应用栈。