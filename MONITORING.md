# 生产级监控方案

## 概述

本监控方案为 ClassSync 笔记应用提供全面的生产级监控能力，包括：

- 应用性能监控 (APM)
- 系统资源监控
- 业务指标监控
- 错误追踪与告警
- 健康检查机制

## 监控架构

### 1. 应用性能监控 (APM)

#### 指标收集
- **请求计数**: 记录每个端点的请求数量，按方法、路径和状态码分类
- **响应时间**: 记录每个请求的处理时间分布
- **活跃请求数**: 实时监控并发请求数量
- **错误率**: 跟踪不同类型的错误发生频率

#### 中间件集成
使用自定义中间件自动收集HTTP请求指标：

```python
class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 自动收集请求指标
        ...
```

### 2. 业务逻辑监控

#### 关键业务流程监控
- 笔记创建、编辑、删除操作
- OCR文本提取过程
- 语音转录处理
- AI内容组织任务

#### 任务执行监控
- 异步任务执行时间
- AI API调用延迟和成功率
- 数据库操作性能

### 3. 系统资源监控

#### 硬件资源
- CPU使用率
- 内存使用情况
- 磁盘空间利用率
- 系统负载

#### 进程信息
- 应用进程内存占用
- CPU使用率
- 线程数量
- 文件描述符数量

### 4. 健康检查机制

#### 基础健康检查
```python
@router.get("/health")
def health_check() -> MessageResponse:
    return MessageResponse(message="ok")
```

#### 扩展健康检查
```python
@router.get("/health/extended")
def extended_health_check() -> DetailedHealthResponse:
    # 返回详细的系统状态信息
    ...
```

#### 依赖服务检查
- 数据库连接状态
- Redis连接状态
- Celery工作进程状态

## 部署配置

### 环境变量配置
```bash
# 启用监控
METRICS_ENABLED=true
# 监控端口
METRICS_PORT=9090
# 日志级别
LOG_LEVEL=INFO
```

### Docker部署示例
```dockerfile
FROM python:3.12-slim-trixie

# 安装依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# 暴露应用端口和监控端口
EXPOSE 8000 9090
```

## 监控仪表板

### Prometheus配置
```yaml
scrape_configs:
  - job_name: 'classsync-app'
    static_configs:
      - targets: ['localhost:9090']
```

### Grafana仪表板建议
1. **API性能概览**
   - 请求速率 (RPS)
   - 平均响应时间
   - 错误率
   - P95/P99响应时间

2. **系统资源监控**
   - CPU使用率
   - 内存使用情况
   - 磁盘I/O

3. **业务指标**
   - 笔记创建数量
   - OCR处理成功率
   - 语音转录成功率
   - AI任务完成率

## 告警规则

### 关键告警指标
```promql
# 高错误率
increase(http_requests_total{status=~"5.."}[5m]) / increase(http_requests_total[5m]) > 0.05

# 高延迟
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2.0

# 系统资源告警
cpu_usage_percent > 80
memory_usage_percent > 80
```

### 告警通知
- 邮件通知
- Slack/Teams集成
- 短信告警

## 最佳实践

### 1. 性能优化
- 使用异步指标收集避免阻塞请求处理
- 合理设置指标保留策略
- 定期清理过期指标

### 2. 安全考虑
- 监控端点不应暴露在公网
- 使用身份验证保护敏感监控数据
- 加密传输监控数据

### 3. 可维护性
- 清晰的指标命名规范
- 定期审查和优化指标收集
- 文档化所有监控规则和阈值

## 扩展性

### 日志聚合
可以与ELK Stack或类似工具集成：
- 结构化日志输出
- 分布式追踪
- 审计日志记录

### 第三方集成
- Sentry错误追踪
- DataDog/AWS CloudWatch
- 自定义告警系统

## 总结

本监控方案提供了完整的可观测性解决方案，包括指标收集、健康检查和系统监控。通过合理的架构设计和最佳实践，能够有效支持生产环境的稳定运行和快速故障排查。