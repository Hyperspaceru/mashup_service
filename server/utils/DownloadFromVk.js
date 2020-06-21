import puppeteer from 'puppeteer'
import fsSync from 'fs'
import https from 'https'
import database from '../models';
import config from '../config/config'
import { spawn } from 'child_process'

const fs = require('fs').promises;
const cmd = '/usr/bin/ffmpeg';

const replaceInFile = async (fileName, regexPattern, replacement) => {
    fsSync.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(regexPattern, replacement);
        fsSync.writeFile(fileName, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
    await new Promise(resolve => setTimeout(resolve, 5000));
}
//"https://vk.com/mp3/audio_api_unavailable.mp3?extra=Ae0OuN0YtJf3A1nqqNC5twTHCZjLDt9xy1bjnf01EfffuJm5v2n5zgzou1jUuKTiqwnlywXzr3rQDwPsCNnUtLCZDdfYnfrjvgvfyKmUAuq6zwv1CMjZyvKXBODkAefpzNDcs3z5C3nux1qVuhzZlwjRohbRExfNq1DTl2z5CffkELfjl3jkt2jowuyVDMXOps1gCdrOneLszvDvnv8XyJzYlMPvDeiYvKvTqMm2Au9Jrei2n20XzhHHyxnNmvfor2XWrJjvs3f1y1HLngKYrdnPnxaUAxz2#AqS5nJy"
// https://cs1-39v4.vkuseraudio.net/p4/2fa9fe5a144cb1.mp3
// иногда попадается прямая ссылка на mp3, а не audio_api_unavailable, поэтому надо учесть
// || songUrl.indexOf("audio_api_unavailable.mp3") !== -1
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
        debugger
        let audioRows = document.querySelectorAll(".wall_text .audio_row");
        let audioData = [];
        for (let audioRow of audioRows) {
            audioData.push(JSON.parse(audioRow.getAttribute('data-audio')));
        }
        let songUrl = ''
        if (audioData.length > 0) {
            songUrl = encode_url(audioData[0][2]);
            if (songUrl.indexOf("/index.m3u8") == -1  ) {
                songUrl = '';
            }           
        }
        return await new Promise((resolve) => {
            resolve(songUrl);
        })
    })()`)
}


const DownloadFromVk = async () => {
    // for debug
    const browser = await puppeteer.launch({ devtools: true });
    // const browser = await puppeteer.launch();
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
            var email = document.getElementById('index_email');
            email.value = myemail;
            var pass = document.getElementById('index_pass');
            pass.value = mypassword;
        }, myemail, mypassword)
        await page.click('#index_login_button');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        if (page.url() == 'https://vk.com/feed') {
            const cookies = await page.cookies();
            await fs.writeFile(config.mashup.puppeteer.cookies, JSON.stringify(cookies, null, 2));
        }
    }
    /// добавить контроль, чтобы больше не загружал, пока текущее не выгрузили
    const wallPosts = await database.mashup.findAll({
        where: {
            approve: true,
            status: null,
            youtubeLink: null,
            audioPath: null
        }
    })
    const progressFinish = wallPosts.length;
    let progressCount = 0;
    for (let wallPost of wallPosts) {
        const downloadDir = `wall${wallPost.publicId}_${wallPost.id}`
        const downloadPath = `${config.mashup.downloadDir}/${downloadDir}`
        if (!fsSync.existsSync(downloadPath)) {
            fsSync.mkdirSync(downloadPath);
        }
        //image download
        let imagePath = `${downloadPath}/${wallPost.id}.jpg`
        const imageFile = await fsSync.createWriteStream(imagePath);
        await https.get(wallPost.imageUrl, function (response) {
            response.pipe(imageFile);
        });

        //audio download
        await page.goto(wallPost.postLink, { waitUntil: 'networkidle2' });
        const audioUrl = await getAudioData(page);
        console.log(1)
        if (audioUrl) {            
            let m3uPath = `${downloadPath}/${wallPost.id}.m3u8`
            const m3uFile = await fsSync.createWriteStream(m3uPath)            
            await https.get(audioUrl,async function (response) {
                await response.pipe(m3uFile).on('error', function (e) {
                    database.mashup.update({
                        audioPath: '',
                        status: 'M3U_DOWNLOAD_ERROR'
                    }, {
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.publicId
                        }
                    })
                })
            })
            await new Promise(resolve => setTimeout(resolve, 5000));
            m3uFile.end()
            let hostUrl = audioUrl.split("index.m3u8")[0]
            let searchPattern = /^.+?\.ts\?extra=.+?\n/gim
            let replaceString = `${hostUrl}$&`
            await replaceInFile(m3uPath, searchPattern, replaceString)
            let audioPath = `${downloadPath}/${wallPost.id}.aac`
            const args = [
                '-y',
                '-protocol_whitelist', 'file,http,https,tcp,tls,crypto',
                '-i', m3uPath,
                '-c', 'copy',
                audioPath
            ]

            let converter = new Promise((resolve, reject) => {
                var proc = spawn(cmd, args,{ shell: true });
                
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

            await converter.then((message) => {
                if (message == 'ok') {
                    database.mashup.update({
                        audioPath: audioPath,
                        imagePath:imagePath
                    }, {
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.publicId
                        }
                    })
                    console.log(`Done : ${wallPost.postLink}`)
                } else {
                    database.mashup.update({
                        audioPath: '',
                        status: 'AAC_CONVERSION_ERROR'
                    }, {
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.publicId
                        }
                    })
                    console.log(`AAC_CONVERSION_ERROR : ${wallPost.postLink}`)
                }
            })
        }
        else {
            await database.mashup.update({
                status: 'AUDIO_NOT_FOUND'
            }, {
                where: {
                    id: wallPost.id,
                    publicId: wallPost.publicId
                }
            })
            await console.log('not found: ' + wallPost.postLink);
        }
        progressCount += 1;
        await console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost.postLink);
    }
    await browser.close();
}

export default DownloadFromVk



