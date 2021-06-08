const puppeteer = require('puppeteer');
const path = require("path");
const fs = require('fs');
var basefolder = path.join(__dirname, "./public/screenshots");
const express = require('express');
var file = require('adm-zip');
var zip = new file();
const app = express();
app.use(express.static("./public/"))
app.use(express.urlencoded({ extended: true }));
require('events').EventEmitter.prototype._maxListeners = 100;
//get page
app.get("/", async (req, res) => { req.send("./public/index.html"); });
//post requrest
app.post("/", async (req, res) => {
    
    var randomeName = "folder_" + Math.floor(Math.random() * 10000000);
    var list = req.body.weblinks.split("\r\n");
    var width = req.body.width;
    var height = req.body.height;
    console.log(width);
    if (list[0] != "" && width!=undefined) {
        await Promise.all(
            list.map(
                async (url) => {
                    var FileName = await path.join(basefolder, randomeName, url.replace(/\//ig, "_"));
                    await fs.mkdirSync(basefolder + "/" + randomeName, { recursive: true });
                    await getScreenShot(url, FileName, randomeName, width, height);
                }
            )
        );
        
        await zip.addLocalFolder(path.join(basefolder, randomeName));
        await zip.writeZip(path.join(basefolder, randomeName + ".zip"));
        fs.rmdirSync(path.join(basefolder, randomeName), { recursive: true });
        
        var urlSetup = req.headers.origin;
        
        urlSetup = (urlSetup.indexOf('localhost')==-1)?"https://responsive-shot.glitch.me/":"http://localhost:3290/";
        
        res.redirect(urlSetup + path.join("screenshots", randomeName + ".zip"));
    }
    else {
        res.end(JSON.stringify({ error: "invalid links" }))
    }
})

// app.listen(3290, () => {
//     console.log(`The server running on port number ${3290}`);
// })
async function getScreenShot(url, FileName, directory, width, height) {
    if(typeof width=="string"){
        width = width.split(" ");
    }
    await Promise.all(width.map(async (w, index) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, { timeout: 0 });
            await page.setViewport({ width: parseInt(w), height: parseInt(height[index]) });
            await page.screenshot({ path: FileName.replace(".", "_").replace(":", "") + w + "x" + height[index] + ".png", fullPage: true });
            await browser.close();
            console.log("iteration");

        } catch (error) {
            console.log(error)
        }
    }))
}

module.exports = app;