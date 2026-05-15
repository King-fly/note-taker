# ClassSync 笔记应用生产级部署方案

## 概述

本方案提供了 ClassSync AI 笔记应用的完整生产级部署配置，包括 Docker 容器化和 Kubernetes 集群部署。

## 架构组件

### 1. 应用层
- **API 服务**: FastAPI 后端服务，处理所有业务逻辑
- **Celery Workers**: 异步任务处理器，负责 OCR、语音转录和 AI 内容组织
- **Flower**: Celery 任务监控界面

### 2. 数据层
- **PostgreSQL**: 主数据库，存储用户数据、笔记内容等
- **Redis**: 缓存和消息队列，支持 Celery 任务分发

### 3. 基础设施层
- **Nginx**: 反向代理和负载均衡
- **Ingress Controller**: 外部流量入口管理
- **Prometheus + Grafana**: 监控和告警系统

## Docker 部署

### Dockerfile 特点
- 基于 `python:3.12-slim-trixie` 轻量镜像
- 包含 OCR 和音频处理依赖 (Tesseract, FFmpeg)
- 使用非 root 用户提升安全性
- 预装 Whisper 模型支持

### Docker Compose 配置
完整的多容器编排配置，包含：
- API 服务 (带健康检查)
- PostgreSQL 数据库
- Redis 缓存
- Celery 工作节点
- Flower 监控界面
- Nginx 反向代理

## Kubernetes 部署

### 部署策略
- **滚动更新**: 确保零停机部署
- **副本管理**: API 服务默认 3 副本，Worker 2 副本
- **自动扩缩容**: 基于 CPU 和内存使用率的 HPA

### 服务发现
- 使用内部 DNS 名称进行服务间通信
- 通过 Service 暴露内部端口

### 存储管理
- PostgreSQL 使用持久卷存储数据
- Redis 使用持久卷存储缓存
- 上传文件使用共享存储卷

### 安全配置
- 敏感信息通过 Kubernetes Secrets 管理
- ConfigMap 存储非敏感配置
- RBAC 权限控制
- Pod 安全策略

### 监控和告警
- Prometheus 指标收集
- ServiceMonitor 配置
- 健康检查端点
- 资源配额和限制

## Helm Chart 部署

提供了完整的 Helm Chart 用于简化部署：

```bash
# 安装 Helm Chart
helm install classsync ./helm/classsync \
  --namespace classsync \
  --create-namespace \
  --set image.tag=v1.0.0

# 升级部署
helm upgrade classsync ./helm/classsync \
  --namespace classsync \
  --set image.tag=v1.0.1

# 回滚部署
helm rollback classsync 1 --namespace classsync
```

## 生产环境最佳实践

### 1. 安全加固
- 使用专用服务账户
- 最小权限原则
- 网络策略限制
- 定期安全扫描

### 2. 性能优化
- 资源请求和限制配置
- 水平 Pod 自动扩缩容
- 数据库连接池优化
- 缓存策略

### 3. 可靠性保障
- 健康检查配置
- 就绪探针和存活探针
- 多副本部署
- 故障转移机制

### 4. 监控告警
- 业务指标监控
- 系统资源监控
- 应用性能监控
- 自定义告警规则

## 部署步骤

### 准备阶段
1. 配置集群环境
2. 设置域名和 SSL 证书
3. 准备私有镜像仓库

### 部署阶段
1. 创建命名空间
2. 部署数据库和缓存
3. 部署应用服务
4. 配置 Ingress
5. 验证部署

### 验证阶段
1. 检查 Pod 状态
2. 验证服务连通性
3. 测试 API 功能
4. 验证监控系统

## 维护指南

### 日常运维
- 监控系统状态
- 查看日志和指标
- 备份重要数据
- 性能调优

### 故障处理
- 快速诊断工具
- 应急响应流程
- 数据恢复机制
- 回滚预案

### 扩容策略
- 水平扩容评估
- 垂直扩容限制
- 数据库分片方案
- CDN 加速配置

## CI/CD 集成

推荐使用以下 CI/CD 流水线：

```yaml
# 示例 CI/CD 配置
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - docker build -t registry/image:$CI_COMMIT_SHA .
    - docker push registry/image:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - helm upgrade classsync ./helm/classsync --set image.tag=$CI_COMMIT_SHA
```

## 总结

本部署方案提供了完整的生产级配置，涵盖了从容器化到 Kubernetes 部署的所有方面。通过使用 Helm Chart，可以快速、可靠地部署和管理 ClassSync 应用，同时保证了安全性、可扩展性和可靠性。