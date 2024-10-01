const fs = require('fs')
// 异步读取
fs.readFile('./src/config.json',(err,data) => {
    if (err) {
        console.error(err)
        return
    } else {
        const json_data = JSON.parse(data)
        console.log(json_data.version)
    }
})
// 同步读取
const data_sync = fs.readFileSync('./src/config.json')
const json_data_sync = JSON.parse(data_sync)
console.log(json_data_sync.version)


