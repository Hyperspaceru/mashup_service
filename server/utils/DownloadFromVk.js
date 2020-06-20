const puppeteer = require('puppeteer')
const fsSync = require('fs')
const https = require('https')
const database = require('../models')
const config = require('../config/config')
const fs = require('fs').promises;

async function getAudioData(page) {
    return await page.evaluate(async function () {
        debugger;
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
        };

        let audioRows = document.querySelectorAll(".wall_text .audio_row");
        let audioData = [];
        // debugger
        for (let audioRow of audioRows) {
            audioData.push(JSON.parse(audioRow.getAttribute('data-audio')));
        }
        let songUrl = ''
        if (audioData.length > 0) {
            songUrl = encode_url(audioData[0][2]);
            if (songUrl.indexOf(".mp3?") == -1) {
                if (songUrl.indexOf("/index.m3u8") == -1) {
                    songUrl = '';
                } else {
                    songUrl = songUrl.replace("/index.m3u8", ".mp3").replace(/\/\w{11}\//, '/');
                }
            }
        }
        return await new Promise(resolve => {
            resolve(songUrl);
        })
    });
}


const DownloadFromVk = async () => {
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
        if (audioUrl) {
            let audioPath = `${downloadPath}/${wallPost.id}.mp3`
            const file = await fsSync.createWriteStream(audioPath);
            await https.get(audioUrl, function (response) {
                response.pipe(file).on('error', function (e) {
                    console.log(e)
                    database.mashup.update({
                        audioPath: '',
                        status: e.toString()
                    }, {
                        where: {
                            id: wallPost.id,
                            postLink: wallPost.publicId
                        }
                    })
                }).on('finish', () => {
                    database.mashup.update({
                        audioPath: audioPath
                    }, {
                        where: {
                            id: wallPost.id,
                            postLink: wallPost.publicId
                        }
                    })
                });
            });
        }
        else {
            await database.mashup.update({
                status: 'AUDIO NOT FOUND'
            }, {
                where: {
                    id: wallPost.id,
                    postLink: wallPost.publicId
                }
            })
            await console.log('not found: ' + wallPost.postLink);
        }
        progressCount += 1;
        await console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost.postLink);
    }
    await browser.close();
}


DownloadFromVk()
