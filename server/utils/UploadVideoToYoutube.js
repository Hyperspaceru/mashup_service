import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fsSync from 'fs'
import database from '../models';
import { Op } from 'sequelize'
import config from '../config/config'

const fs = require('fs').promises;

const UploadVideoToYoutube = () => {
    puppeteer.use(StealthPlugin())
    // puppeteer usage as normal
    // puppeteer.launch({ headless: true }).then(async browser => {
    puppeteer.launch({ headless: false }).then(async browser => {
        const page = await browser.newPage()
        try {
            const cookiesString = await fs.readFile(config.mashup.youtube.cookies);
            const cookies = await JSON.parse(cookiesString);
            await page.setCookie(...cookies);
        } catch (error) {
            console.log("youtube cookies not exits, create new...");
        }
        await page.goto('https://youtube.com', { waitUntil: 'networkidle2' });
        let checkAuthElemExist = async () => {
            return await page.evaluate(`(async () => {
                return await new Promise(resolve => {
                    resolve(document.querySelectorAll('#avatar-btn').length > 0 ? true : false)
                })
            })()`)
        }
        let authElem = await checkAuthElemExist()
        if (!authElem) {
            await page.evaluate(() => {
                document.querySelectorAll('#buttons .yt-simple-endpoint.style-scope.ytd-button-renderer')[0].click()
            })
            await page.waitForNavigation({ waitUntil: 'networkidle2' })
            await page.waitFor(5000);
            let myEmail = config.mashup.youtube.email
            let myPassword = config.mashup.youtube.password
            await page.evaluate((email) => {
                document.querySelectorAll('[type="email"]')[0].value = email
                document.querySelectorAll('[role="button"]#identifierNext')[0].click()
            }, myEmail)
            await page.waitForNavigation({ waitUntil: 'networkidle2' })
            await page.waitFor(5000);
            await page.evaluate((password) => {
                document.querySelectorAll('[type="password"]')[0].value = password
                document.querySelectorAll('[role="button"]#passwordNext')[0].click()
            }, myPassword)
            await page.waitFor(20000);
            await page.evaluate(() => {
                document.querySelectorAll('input[value="108053260554169632683"]')[0].click()
                document.querySelectorAll('#identity-prompt-confirm-button')[0].click()
            })
            await page.waitFor(5000);
            authElem = await checkAuthElemExist()
            if (authElem) {
                const cookies = await page.cookies();
                await fs.writeFile(config.mashup.youtube.cookies, JSON.stringify(cookies, null, 2));
            }
        }

        const wallPosts = await database.mashup.findAll({
            where: {
                videoPath: {
                    [Op.ne]: null
                },
                youtubeLink: null,
                status: null,
                approve: true
            }
        })

        const progressFinish = wallPosts.length;
        let progressCount = 0;

        for (let wallPost of wallPosts) {
            await page.setBypassCSP(true);
            await page.goto('https://studio.youtube.com/channel/UClzF_HUhGumeqPja1UaXWhQ/videos/upload?d=ud', { waitUntil: 'networkidle2' });
            await page.waitFor(5000);
            const inputUploadHandle = await page.$('input[type=file]');
            await inputUploadHandle.uploadFile(wallPost.videoPath);
            await page.evaluate(()=>{
                let fileUpload = document.getElementsByName('Filedata')[0]
                if ("createEvent" in document) {
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent("change", false, true);
                    fileUpload.dispatchEvent(evt);
                }
                else
                    fileUpload.fireEvent("onchange");
            })

            // const [fileChooser] = await Promise.all([
            //     page.waitForFileChooser(),
            //     page.click('#select-files-button'), // some button that triggers file selection
            // ]);
            // await fileChooser.accept([wallPost.videoPath]);

            // await page.click('#select-files-button')
            // const uploadInput = await page.$('input[type="file"]')
            // await uploadInput.uploadFile('')
            await page.waitFor(20000);
            let title = `${wallPost.author} - ${wallPost.title}`
            let description = '#mashup #мэшап \n \nSource: ' + wallPost.postLink
            await page.waitForSelector('[label="Title"] #textbox', { 'timeout': 0 });
            await page.waitFor(2000);
            await page.focus('[label="Title"] #textbox');
            await page.keyboard.type(title)
            await page.focus('[label="Description"] #textbox');
            await page.keyboard.type(description)
            // await page.evaluate((title,description) => {
            //     document.querySelectorAll('[label="Title"] #textbox')[0].innerHTML=title
            //     document.querySelectorAll('[label="Description"] #textbox')[0].innerHTML=description
            // },title,description)
            // await setSelectVal('[label="Title"] #textbox', wallPost[3])
            // await setSelectVal('[label="Description"] #textbox', '#mashup #мэшап \n \nSource: ' + wallPost[1])
            await page.evaluate(() => {
                document.querySelectorAll('[label="More options"]')[0].click()
            })
            // await page.click('[label="More options"]')
            await page.waitFor(1000);
            let tags = 'mashup,мэшап'
            await page.focus('[input-aria-label="Tags"] #text-input');
            await page.keyboard.type(tags)
            // await page.evaluate((tags) => {
            //     document.querySelectorAll('[input-aria-label="Tags"] #text-input')[0].value=tags
            // },tags)
            await page.keyboard.press('Enter');
            await page.waitFor(1000);
            // await setSelectVal('[input-aria-label="Tags"] #text-input', )
            await page.click('#next-button')
            await page.waitFor(1000);
            await page.click('#next-button')
            await page.waitFor(1000);
            await page.evaluate(() => {
                document.querySelectorAll('[name="PUBLIC"]')[0].checked = true
                document.querySelectorAll('[name="PUBLIC"]')[0].setAttribute('aria-checked', 'true')
                document.querySelectorAll('[name="PUBLIC"]')[0].setAttribute('aria-selected', 'true')
                document.querySelectorAll('[name="PUBLIC"]')[0].setAttribute('toggles', '')
                document.querySelectorAll('[name="PUBLIC"]')[0].setAttribute('active', '')
                document.querySelectorAll('[name="PUBLIC"]')[0].setAttribute('checked', '')
                document.querySelectorAll('[name="PUBLIC"]')[0].click()
            })
            await page.waitFor(1000);
            let uploadLink = await page.$('a.style-scope.ytcp-video-info')
            let youtubeLink = await uploadLink.getProperty('href')
            youtubeLink = youtubeLink._remoteObject.value
            await page.waitFor(5000);
            await page.click('#done-button')
            await page.waitFor(3000);
            await database.mashup.update({
                youtubeLink: youtubeLink
            }, {
                where: {
                    id: wallPost.id,
                    publicId: wallPost.publicId
                }
            })
            const downloadDir = `wall${wallPost.publicId}_${wallPost.id}`
            let deleteDir = `${config.mashup.downloadDir}/${downloadDir}`;
            await fsSync.rmdir(deleteDir, { recursive: true }, () => { console.log('Deleted - ' + deleteDir) });
            console.log('Done : ' + wallPost[1])
            await page.waitFor(10000);

            progressCount += 1;
            console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost.postLink);
        }
        await browser.close()
    })
}

export default UploadVideoToYoutube