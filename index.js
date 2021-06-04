const puppeteer = require('puppeteer');
const path = require("path");
const fs = require('fs');
var basefolder= "./screenshots";
// const fullPageScreenshot = require("puppeteer-full-page-screenshot");

async function run(ar) {
    var randomeName = "folder_"+Math.floor(Math.random()*10000000);
    
    ar.forEach((url)=>{
        var FileName = path.join(basefolder,randomeName,url.replace(/\//ig,"_"));
        fs.mkdirSync(basefolder+"/"+randomeName,{recursive:true});
        getScreenShot(url,FileName,randomeName);
    })
  
}

async function getScreenShot(url,FileName,directory){
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url,{timeout: 0});
        await page.setViewport({ width: 480, height: 853 });
        await page.screenshot({ path: FileName.replace(".","_").replace(":","")+".png",fullPage:true});
        await browser.close();
        
    } catch (error) {
        console.log(error)
    }
}
run(["https://www.google.com","https://www.yahoo.com"]);