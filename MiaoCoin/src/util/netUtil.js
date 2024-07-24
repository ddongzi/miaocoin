const os = require('os');

// 获取所有网络接口信息
const interfaces = os.networkInterfaces();

function getLocalIP() {
    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const alias of iface) {
            // 检查 IPv4 地址并排除内网回环地址
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return null; // 没有找到 IP 地址
}
module.exports = {getLocalIP}