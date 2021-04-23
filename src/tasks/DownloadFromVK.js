import { Task } from "actionhero";
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fsSync from 'fs'
import { https as httpsRedirect } from 'follow-redirects'
import database from '../models'
import { Op } from 'sequelize'
import config from '../config/config'
import { spawn } from 'child_process'
import DownloadQuota from "../utils/DownloadQuota"

const fs = require('fs').promises;
const cmd = '/usr/bin/streamlink';

export class MyTask extends Task {
    constructor() {
        super();
        this.name = "DownloadFromVK";
        this.description = "an actionhero task";
        this.frequency = 0;
        this.queue = "default";
        this.middleware = [];
    }

    async run(data) {
        let quota = await new DownloadQuota()
        await DownloadFromVk(quota)
    }
}






const downloadFile = (url, path) => {
    return new Promise((resolve) => {
        const fileStream = fsSync.createWriteStream(path);
        fileStream.on('finish', () => {
            resolve('Done')
        })
        httpsRedirect.get(url, function (response) {
            response.pipe(fileStream).on('error', function (e) {
                let errorMessage = { code: 1, message: `FILE_DOWNLOAD_ERROR: ${path}` };
                throw errorMessage
            })
        })
    })
}

const convertM3U8 = (m3u8Path, audioPath) => {
    const args = [
        'hlsvariant://file:///' + m3u8Path,
        'best',
        '-f',
        '-o', audioPath
    ]

    let converter = new Promise((resolve, reject) => {
        var proc = spawn(cmd, args, { shell: true });
        // for debug purposes
        proc.stdout.on('data', function (data) {
            console.log(data);
        });
        proc.stderr.setEncoding("utf8")
        proc.stderr.on('data', function (data) {
            console.log(data);
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(`process exited with code ${code}`);
            } else {
                resolve('ok')
            }
        });
    })
    return converter.then((message) => {
        if (message === 'ok') {
            console.log('M3U8 CONVERSION OK')
        } else {
            let errorMessage = { code: 1, message: `AAC_CONVERSION_ERROR` };
            throw errorMessage
        }
    })
}

const downloadM3U8 = async (url, path) => {
    await downloadFile(url, path)
    //add hostname to source urls in m3u8 file
    let hostUrl = url.split("index.m3u8")[0]
    let searchPattern = /^.+?\.ts\?extra=.+?\n/gim
    let replaceString = `${hostUrl}$&`
    return await replaceInFile(path, searchPattern, replaceString)
}

const replaceInFile = async (fileName, regexPattern, replacement) => {
    let data = await fs.readFile(fileName, { encoding: 'utf8' })
    let result = data.replace(regexPattern, replacement);
    return await fs.writeFile(fileName, result, 'utf8')
}
//"https://vk.com/mp3/audio_api_unavailable.mp3?extra=Ae0OuN0YtJf3A1nqqNC5twTHCZjLDt9xy1bjnf01EfffuJm5v2n5zgzou1jUuKTiqwnlywXzr3rQDwPsCNnUtLCZDdfYnfrjvgvfyKmUAuq6zwv1CMjZyvKXBODkAefpzNDcs3z5C3nux1qVuhzZlwjRohbRExfNq1DTl2z5CffkELfjl3jkt2jowuyVDMXOps1gCdrOneLszvDvnv8XyJzYlMPvDeiYvKvTqMm2Au9Jrei2n20XzhHHyxnNmvfor2XWrJjvs3f1y1HLngKYrdnPnxaUAxz2#AqS5nJy"
// https://cs1-39v4.vkuseraudio.net/p4/2fa9fe5a144cb1.mp3
// иногда попадается прямая ссылка на mp3, а не audio_api_unavailable, поэтому надо учесть
const getAudioData = async (page) => {
    return await page.evaluate(`(async () => {
        //если вылетает ошибка, нужно использовать версию puppeteer
        function encode_url(t) {
            //функция, декодирующая ссылку на аудиозапись
            let c = {
                v: (t) => { return t.split('').reverse().join('') }, r: (t, e) => { t = t.split(''); for (let i, o = _ + _, a = t.length; a--;) ~(i = o.indexOf(t[a])) && (t[a] = o.substr(i - e, 1)); return t.join('') },
                s: (t, e) => { let i = t.length; if (i) { let o = function (t, e) { let i = t.length, o = []; if (i) { let a = i; for (e = Math.abs(e); a--;) e = (i * (a + 1) ^ e + a) % i, o[a] = e } return o }(t, e), a = 0; for (t = t.split(''); ++a < i;) t[a] = t.splice(o[i - 1 - a], 1, t[a])[0]; t = t.join('') } return t },
                i: (t, e) => { return c.s(t, e ^ vk.id) }, x: (t, e) => { let i = []; return e = e.charCodeAt(0), each(t.split(''), (t, o) => { i.push(String.fromCharCode(o.charCodeAt(0) ^ e)) }), i.join('') }
            }, _ = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=', h = (t) => { if (!t || t.length % 4 == 1) return !1; for (var e, i, o = 0, a = 0, s = ''; i = t.charAt(a++);) ~(i = _.indexOf(i)) && (e = o % 4 ? 64 * e + i : i, o++ % 4) && (s += String.fromCharCode(255 & e >> (- 2 * o & 6))); return s };
            if ((!window.wbopen || !~(window.open + '').indexOf('wbopen')) && ~t.indexOf('audio_api_unavailable')) {
                let e = t.split('?extra=')[1].split('#'), i = '' === e[1] ? '' : h(e[1]);
                if (e = h(e[0]), 'string' != typeof i || !e) return t; for (var o, a, s = (i = i ? i.split(String.fromCharCode(9)) : []).length; s--;) { if (o = (a = i[s].split(String.fromCharCode(11))).splice(0, 1, e)[0], !c[o]) return t; e = c[o].apply(null, a) } if (e && 'http' === e.substr(0, 4)) return e
            } return t
        }
        function getFullAudioId (dataAudio) {
            let hashArr=dataAudio[13].split('/');
            return dataAudio[1]+'_'+dataAudio[0]+'_'+hashArr[2]+'_'+hashArr[5]
        }
        async function getAudioUrl (fullId){
            let rqvst = await new Promise((resolve,reject)=>{
                ajax.post("al_audio.php?act=reload_audio", {
                    ids: fullId
                },{onDone:(t,i,a,o)=>{
                    resolve(t)
                },onFail:t=>reject(t)})
            })
            return rqvst[0][2]
        }
        let audioRows = document.querySelectorAll(".wall_text .audio_row");
        let audioData = [];
        for (let audioRow of audioRows) {
            let fullId = getFullAudioId(JSON.parse(audioRow.getAttribute('data-audio')))
            return getAudioUrl(fullId).then(encryptedUrl=>encode_url(encryptedUrl)).then(decryptedUrl=>{
                let songUrl = ''
                if (!decryptedUrl.indexOf("audio_api_unavailable.mp3") > -1  ) {
                    songUrl = decryptedUrl;
                }   
                return new Promise((resolve) => {
                    resolve(songUrl);
                })

            })
        }
        // let songUrl = ''
        // debugger
        // if (audioData.length > 0) {
        //     songUrl = encode_url(audioData[0]);
        //     if (songUrl.indexOf("audio_api_unavailable.mp3") > -1  ) {
        //         songUrl = '';
        //     }           
        // }
        // return await new Promise((resolve) => {
        //     resolve(songUrl);
        // })
    })()`)
}


const DownloadFromVk = async (quota) => {
    await puppeteer.use(StealthPlugin())
    // for debug
    // puppeteer usage as normal
    // puppeteer.launch({ headless: true }).then(async browser => {
    await puppeteer.launch({ headless: false }).then(async browser => {
        return new Promise(async (resolve, reject) => {
            const page = await browser.newPage();

            try {
                const cookiesString = await fs.readFile(config.mashup.puppeteer.cookies);
                const cookies = await JSON.parse(cookiesString);
                await page.setCookie(...cookies);
            } catch (error) {
                console.log("File cookies does not exits, creating new...");
            }

            await page.goto('https://vk.com', { waitUntil: 'networkidle2' });
            if (page.url() != 'https://vk.com/feed') {
                await page.goto('https://vk.com', { waitUntil: 'networkidle2' });
                let myemail = config.mashup.vk.email;
                let mypassword = config.mashup.vk.password;
                await page.evaluate((myemail, mypassword) => {
                    let email = document.getElementById('index_email');
                    email.value = myemail;
                    let pass = document.getElementById('index_pass');
                    pass.value = mypassword;
                }, myemail, mypassword)
                await page.click('#index_login_button');
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
                if (page.url() == 'https://vk.com/feed') {
                    const cookies = await page.cookies();
                    await fs.writeFile(config.mashup.puppeteer.cookies, JSON.stringify(cookies, null, 2));
                }
            }
            const above = database.mashup.findAll({
                where: { approve: true, status: null, youtubeLink: null, audioPath: null,likes:{[Op.gt]:quota.averageLikes} },
                limit: quota.quotaAboveAverageLikes
            })
            const below = database.mashup.findAll({
                where: { approve: true, status: null, youtubeLink: null, audioPath: null,likes:{[Op.lt]:quota.averageLikes} },
                limit: quota.quotaBelowAverageLikes
            })
            const wallPosts = await Promise.all([above,below]).then(([aboveRes,belowRes]) => [...aboveRes,...belowRes])

            const progressFinish = wallPosts.length;
            let progressCount = 0;
            for (let wallPost of wallPosts) {
                try {
                    const downloadDir = `wall${wallPost.publicId}_${wallPost.id}`
                    const downloadPath = `${config.mashup.downloadDir}/${downloadDir}`
                    if (!fsSync.existsSync(downloadPath)) {
                        fsSync.mkdirSync(downloadPath);
                    }
                    //image download
                    let imagePath
                    if (wallPost.imageExt === 'jpg') {
                        imagePath = `${downloadPath}/${wallPost.id}.jpg`
                    } else if (wallPost.imageExt === 'gif/mp4') {
                        imagePath = `${downloadPath}/${wallPost.id}.gif.mp4`
                    } else if (wallPost.imageExt === 'gif') {
                        imagePath = `${downloadPath}/${wallPost.id}.gif`
                    }
                    await downloadFile(wallPost.imageUrl, imagePath)


                    //audio download
                    await page.goto(wallPost.postLink, { waitUntil: 'networkidle2' });
                    const audioUrl = await getAudioData(page);
                    let audioPath = ''
                    if (audioUrl) {
                        let audioExt = (audioUrl.indexOf("/index.m3u8") === -1) ? "mp3" : "m3u8"
                        audioPath = `${downloadPath}/${wallPost.id}.${audioExt}`
                        if (audioExt === "mp3") {
                            await downloadFile(audioUrl, audioPath)
                        } else {
                            await downloadM3U8(audioUrl, audioPath)
                            let m3u8Path = audioPath
                            audioPath = `${downloadPath}/${wallPost.id}.aac`
                            await convertM3U8(m3u8Path, audioPath)
                        }
                    } else {
                        let errorMessage = { code: 1, message: 'AUDIO_NOT_FOUND' };
                        throw errorMessage
                    }
                    await database.mashup.update({
                        audioPath: audioPath,
                        imagePath: imagePath
                    }, {
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.publicId
                        }
                    })

                    console.log(`Done : ${wallPost.postLink}`)
                } catch (e) {

                    database.mashup.update({
                        audioPath: null,
                        imagePath: null,
                        status: e.message.toString()
                    }, {
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.publicId
                        }
                    })
                }
                progressCount += 1;
                await console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost.postLink);
            }
            resolve('Done')
        }).finally(() => {
            browser.close()
        })
    })
}



