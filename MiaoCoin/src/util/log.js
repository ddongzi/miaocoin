const path = require('path')
const colors = require('ansi-colors');
const {format} = require('date-fns');
const util = require('util')

class Logger {
    constructor(module_path) {
        this.module_name = path.dirname(module_path).split(path.sep).pop().padEnd(10, ' ')
        this.file_name = path.basename(module_path, '.js').padEnd(10, ' ')
    }
    log (data) {
        const now = new Date();
        const format_now = format(now, 'yyyy-MM-dd HH:mm:ss');
        console.log(`[LOG]${colors.green(`[${this.module_name}]`)}${colors.blue(`[${this.file_name}]`)}${colors.yellow(`[${format_now}]`)}${data}`);
    }
    err (data) {
        const now = new Date();
        const format_now = format(now, 'yyyy-MM-dd HH:mm:ss');
        console.log(`${colors.bgRed('[ERR]')}${colors.red(`[${this.module_name}]`)}${colors.red(`[${this.file_name}]`)}${colors.red(`[${format_now}]`)}${colors.redBright(data)}`);
    }
}
module.exports = Logger