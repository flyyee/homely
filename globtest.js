const fs = require("fs")
const glob = require("glob")
var getDirectories = function (src) {
    return new Promise((resolve, reject) => {
        glob(src + '/**/*', (err, files) => {
            if (err) reject(err)
            for (let x = 0; x < files.length; x++) {
                if (fs.lstatSync(files[x]).isDirectory()) {
                    files[x] += "?"
                }
                files[x] = files[x].substring(src.length + 1)
            }
            resolve(files)
        });
    })

};
// getDirectories('data').catch(err => {})
// .then(res => {
//     console.log(res)
// })

async function v(directory) {
    return new Promise((resolve, reject) => {
        glob(directory + '/**/*', (err, files) => {
            console.log(files)
            if (err) reject(err)
            for (let x = 0; x < files.length; x++) {
                if (fs.lstatSync(files[x]).isDirectory()) {
                    files[x] += "?"
                }
                files[x] = files[x].substring(directory.length + 1)
            }
            resolve(files)
        });
    })
}

v("data").then(res => console.log(res)).catch(err => {
    throw err
})