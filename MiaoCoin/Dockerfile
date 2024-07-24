# 使用官方的 Node.js 镜像作为基础镜像
FROM node:20

# 设置工作目录
WORKDIR /home/dong/JSCODE/MiaoCoin

RUN npm cache clean --force

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装应用依赖
RUN npm i

# 复制应用代码
COPY . .

# 安装网络工具
# RUN apt-get update && apt-get install -y ip

# 暴露 HTTP 服务端口

# 暴露 P2P 服务端口

# 启动应用
CMD ["node", "./src/app.js"]
