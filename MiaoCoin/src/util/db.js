const fs = require('fs-extra');
const path = require('path');

class DB {
    constructor(filePath) {
        this.filePath = filePath;
    }
    read(prototype, defaultData) {
        if (!fs.existsSync(this.filePath)) {
            console.log("Could not find", this.filePath)
            return defaultData;
        }

        var content = fs.readFileSync(this.filePath)
        if (content.length === 0) return defaultData;
        return (prototype) ?  prototype.fromJson(JSON.parse(content)) :JSON.parse(content);
    }
    write(data) {
        console.log(`write ${data} ${this.filePath}`);
        fs.ensureDirSync(path.dirname(this.filePath))
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 4))
    }
}
module.exports = DB