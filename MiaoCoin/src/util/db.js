const fs = require('fs-extra');
const path = require('path');
const Logger = require('../util/log')
const logger = new Logger(__filename)
class DB {
    constructor(filePath) {
        this.filePath = filePath;
    }
    read(prototype, defaultData) {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '')
            return defaultData;
        }

        var content = fs.readFileSync(this.filePath)
        if (content.length === 0) return defaultData;
        return (prototype) ?  prototype.fromJson(JSON.parse(content)) :JSON.parse(content);
    }
    write(data) {
        fs.ensureDirSync(path.dirname(this.filePath))
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 4))
    }
}
module.exports = DB