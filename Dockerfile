# 多阶段构建，优化最终镜像大小
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm（可选，更快的包管理器）
RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# 安装生产依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源代码
COPY . .

# 构建应用
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_EMAILJS_SERVICE_ID=$VITE_EMAILJS_SERVICE_ID
ENV VITE_EMAILJS_TEMPLATE_ID=$VITE_EMAILJS_TEMPLATE_ID
ENV VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY

RUN pnpm run build

# 生产阶段
FROM nginx:1.25-alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建必要的目录
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 添加健康检查脚本
COPY <<EOF /usr/local/bin/health-check.sh
#!/bin/sh
curl -f http://localhost:80/health || exit 1
EOF

RUN chmod +x /usr/local/bin/health-check.sh

# 创建健康检查端点
COPY <<EOF /usr/share/nginx/html/health
{
  "status": "healthy",
  "timestamp": "$(date -Iseconds)",
  "service": "elderly-health-app"
}
EOF

# 创建非 root 用户运行 nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# 更改文件所有权
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# 修改 nginx.conf 以使用非 root 用户
RUN sed -i 's/user nginx;/user nginx-user;/' /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD /usr/local/bin/health-check.sh

# 添加标签
LABEL maintainer="your-email@example.com"
LABEL version="1.0.0"
LABEL description="Elderly Health Charity Web Application"

# 切换到非 root 用户
USER nginx-user

# 启动命令
CMD ["nginx", "-g", "daemon off;"]