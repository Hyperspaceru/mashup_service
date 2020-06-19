const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const cliProgress = require('cli-progress');

let credentials = {}
try {
    const credentialString = fsSync.readFileSync('./creds/credentials.json');
    credentials = JSON.parse(credentialString);
} catch (error) {
    console.log("Credentials not exits" + error.toString());
}

const { Client } = require('pg');
const client = new Client(credentials.db);

client.connect();


(async () => {
    // const browser = await puppeteer.launch({ devtools: true });
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        const cookiesString = await fs.readFile('./creds/cookies.json');
        const cookies = await JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (error) {
        console.log("File not exits" + error.toString());
    }



    await page.goto('https://vk.com', { waitUntil: 'networkidle2' });
    if (page.url() != 'https://vk.com/feed') {
        await page.goto('https://vk.com', { waitUntil: 'networkidle2' });
        let myemail = credentials.vk.email;
        let mypassword = credentials.vk.password;
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
            await fs.writeFile('./creds/cookies.json', JSON.stringify(cookies, null, 2));
        }
    }
    //debug only
    //await page.pdf({ path: 'hn.pdf', format: 'A4' });

    const wallPosts = await client
        .query({
            text: "SELECT * FROM mashup WHERE audio_path is NULL and status is NULL",
            rowMode: "array"
        })
        .catch(e => console.error(e.stack))
    const progressFinish = wallPosts.rows.length;
    let progressCount = 0;
    for (let wallPost of wallPosts.rows) {
        await page.goto(wallPost[1], { waitUntil: 'networkidle2' });
        const getAudioData = async () => {
            return await page.evaluate(async () => {
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
                let songName = ''
                let songUrl = ''
                if (audioData.length>0) {
                    songName = audioData[0][4] + ' - ' + audioData[0][3];
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
                    resolve([songName, songUrl]);
                })
            });
        }
        let audioData = await getAudioData();
        if (audioData[1]) {
            let downloadDir = './download'
            let downloadPath = downloadDir + '/' + wallPost[0] + '/' + wallPost[0] + '.mp3'
            const file = await fsSync.createWriteStream(downloadPath);
            const request = await https.get(audioData[1], function (response) {
                response.pipe(file).on('error', function (e) {
                    console.log(e)
                    client.query('UPDATE mashup set audio_path=$1, status=$2 where id=$3 and post_link=$4', ['', e.toString(), wallPost[0], wallPost[1]]);
                }).on('finish', () => {
                    client.query('UPDATE mashup set audio_path=$1 where id=$2 and post_link=$3', [downloadPath, wallPost[0], wallPost[1]]);
                });
            });
        }
        else {
            await client.query('UPDATE mashup set status=$1 where id=$2 and post_link=$3', ['AUDIO NOT FOUND', wallPost[0], wallPost[1]]);
            await console.log('not found: ' + wallPost[1]);
        }
        progressCount += 1;
        await console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost[1]);
    }
    await browser.close();
    await progress.stop();
    await client.end();
})();



// if (!fs.existsSync(downloadPath)) {
//     fs.mkdirSync(downloadPath);
// }

// const file = await fs.createWriteStream(image_path);
// const request = await https.get(image_url, function (response) {
//     response.pipe(file);
// });

// let downloadPath = downloadDir + '/' + id
// let image_path = downloadPath + '/' + id + '.' + imageExt;