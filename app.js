const heroku_url = 'https://flyyee-homely.herokuapp.com'  // without trailing forward slash
// const heroku_url = 'http://localhost:9050'  // without trailing forward slash

const fs = require("fs")
const archiver = require('archiver');
const express = require("express")
const bodyParser = require('body-parser');
const glob = require("glob")
var cors = require('cors')

class call_history {
    constructor() {
        this.history = []
    }
    push(filename, content) {
        this.history = [[filename, content]]
    }
    view() {
        if (this.history[0]) return [this.history[0][0], this.history[0][1]]
        return ["No previous search", "No previous data."]
    }
    clear() {
        this.history = []
        return 0
    }
}

async function v_old(directory) {
    return new Promise(async (resolve, reject) => {
        await fs.readdir(directory, (err, res) => { // TODO: parses folders same as files
            if (err) reject(err)
            for (let file of directory) {
                console.log(file)
            }
            resolve(res)
        })
    })
}

async function v(directory) {
    // TODO: use fast-glob module to set maximum depth of traversal
    return new Promise((resolve, reject) => {
        glob(directory + '/**/*', (err, files) => {
            // console.log(files)
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

function r(directory, filename, callback) {
    let constructed_file = directory + "/" + filename
    if (fs.existsSync(constructed_file)) {
        fs.readFile(constructed_file, 'utf8', (err, buffer) => {
            if (err) callback(2)
            // console.log(buffer)
            callback(0, buffer)
        })
    } else {
        callback(1)
    }
}

function w(filename) {

}

async function main() {
    const directory = "data"

    let history = new call_history

    let app = express()
    app.use(cors({
        origin: heroku_url,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/", (req, res) => {
        console.log("HIT: /")
        // console.log(req)
        res.sendFile("pages/site.html", {
            root: __dirname
            // root: "C:/Users/Gerrard Tai/Documents/code/home"
        })
        // res.send("hello world")
    })

    app.post("/formsubmit", (req, res) => {
        console.log("HIT: formsubmit")
        console.log(req.body.filename_input)
        r(directory, req.body.filename_input, (err, res) => {
            if (err) {
                history.push(req.body.filename_input, "Unable to read file.")
            } else {
                history.push(req.body.filename_input, res)
            }
        })
        res.redirect("/")
    })

    app.post("/api/fake_formsubmit", (req, res) => {
        console.log("HIT: fake_formsubmit")
        console.log(req.body.filename)
        r(directory, req.body.filename, (err, res) => {
            if (err) {
                history.push(req.body.filename, "Unable to read file.")
            } else {
                history.push(req.body.filename, res)
            }
        })
        res.send("0")
    })

    app.get("/api/get_last_reply", (req, res) => {
        res.send({
            filename: history.view()[0],
            data: history.view()[1]
        })
    })

    app.post("/api/clear_last_reply", (req, res) => {
        let success = history.clear()
        res.send({
            outcome: success
        })
    })

    app.get("/api/get_files", async (site_req, site_res) => {
        let files
        files = v(directory)
            .catch(err => {
                console.log("issue")
                console.log(err)
                files = ["error_getting_files"]
                site_res.send({
                    files: files
                })
            })
            .then(res => {
                site_res.send({
                    files: res
                })
            })
    })

    let download_filename

    app.post('/api/download_last_file', (req, res) => {
        console.log("apid")
        download_filename = req.body.filename
        res.sendStatus(200)
    })

    app.post('/api/set_cdownload_files', (site_req, site_res) => {
        new Promise((resolve, reject) => {
            let file_list = site_req.body.file_list
            console.log(file_list)
            let zip_name = "zips/cdownload_files.zip" // TODO: add unique id (maybe from cookies) that identifiers user to their stage
            // will allow for deletion afterwards, and ensures that users do not download other users' stage
            if (fs.existsSync(zip_name)) fs.unlinkSync(zip_name)

            const output = fs.createWriteStream(zip_name);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            archive.pipe(output)
        
            let prev_folder = ""
            for (let x = 0; x < file_list.length; x++) {
                let file = file_list[x]
                if (prev_folder.length > 0 && file.length >= prev_folder.length) {
                    if (prev_folder) {
                        if (file.substr(0, prev_folder.length) == prev_folder) {
                            continue
                        } else {
                            if (fs.lstatSync("data/" + file).isDirectory()) prev_folder = file
                        }
                    } else {
                        if (fs.lstatSync("data/" + file).isDirectory()) prev_folder = file
                    }
                } else {
                    if (fs.lstatSync("data/" + file).isDirectory()) prev_folder = file
                }
                original_file = file
                file = "data/" + file
                if (!fs.existsSync(file)) continue
                if (fs.lstatSync(file).isDirectory()) {
                    archive.directory(file, original_file)
                } else {
                    archive.append(fs.createReadStream(file), { name: original_file });
                }
                
            }
        
            output.on('close', function () {
                // console.log(archive.pointer() + ' total bytes');
                // console.log('archiver has been finalized and the output file descriptor has closed.');
                resolve()
            });
            
            archive.finalize();
        }).then(res => {
            site_res.sendStatus(200)
        }).catch(err => {
            console.log(err)
            site_res.sendStatus(404)
        })
    })

    app.get("/cdownload_files", (req, res) => {
        let zip_name = "zips/cdownload_files.zip"
        if (fs.existsSync(zip_name)) {
            res.download(zip_name)
        } else {
            res.sendStatus(404)
        }
    })

    app.get('/download_last_file', function (req, res) {
        console.log("thed")
        // let filename = req.body.filename
        let filename = download_filename
        try {
            let constructed_file = directory + "/" + filename
            console.log("here")
            res.download(constructed_file, err => {
                console.log(err)
            });
        } catch (err) {
            console.log("walao")
        }
    });

    app.get("/download_all_files", (site_req, site_res) => {
        // // TODO: use promise.all and async functions to concurrently load necessary functions
        // if (fs.existsSync("zips/all.zip")) fs.unlinkSync("zips/all.zip")

        // const output = fs.createWriteStream("zips/all.zip");
        // const archive = archiver('zip', {
        //     zlib: { level: 9 } // Sets the compression level.
        // });
        // archive.pipe(output)

        // // TODO: use heroku instance
        // // TODO: re-write using v, since the following fails on folders
        // let files = fs.readdirSync(directory)
        // for (let file of files) {
        //     let constructed_file = directory + "/" + file
        //     archive.append(fs.createReadStream(constructed_file), { name: file });
        // }

        // output.on('close', function () {
        //     // console.log(archive.pointer() + ' total bytes');
        //     // console.log('archiver has been finalized and the output file descriptor has closed.');
        //     site_res.download("zips/all.zip")
        // });

        // archive.finalize();
        site_res.download("zips/all.zip")
    })

    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 9050;
    }

    let server = app.listen(port, () => {
        console.log(`Localhost server started up at port ${port}`)
    })

}

main()


// async function m() {
//     await fs.readdir("./data/", (err, res) => { // TODO: parses folders same as files
//         if (err) throw err
//         console.log(res)
//     })
// }
// m()
