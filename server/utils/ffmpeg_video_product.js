const spawn = require('child_process').spawn;
const fs = require('fs');

var cmd = '/usr/bin/ffmpeg';

let credentials = {}
try {
    const credentialString = fs.readFileSync('./creds/credentials.json');
    credentials = JSON.parse(credentialString);
} catch (error) {
    console.log("Credentials not exits" + error.toString());
}

const { Client } = require('pg');
const client = new Client(credentials.db);
client.connect();

(async () => {

    const wallPosts = await client
        .query({
            text: "SELECT * FROM mashup WHERE audio_path is not null and status is null and video_path is null",
            rowMode: "array"
        })
        .catch(e => console.error(e.stack))

    const progressFinish = wallPosts.rows.length;
    let progressCount = 0;
    let downloadDir = './download'

    for (let wallPost of wallPosts.rows) {

        let outputPath = downloadDir + '/' + wallPost[0] + '/' + wallPost[0] + '.mp4'
       
        var args = [
            '-y',
            '-loop', '1',
            '-framerate', '2',
            '-i', wallPost[5],
            '-i', wallPost[5],
            '-i', wallPost[6],
            '-filter_complex', '[0:v]gblur=sigma=40,scale=2000x2000,crop=w=1280:h=720,setsar=1,setdar=16/9[v0];[1:v]scale=w=-1:h=\'min(720\\, ih*3/2)\'[v1a];[v1a]scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1[v1b];[v0][v1b]overlay=(W-w)/2:(H-h)/2,crop=w=1280:h=720',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-tune', 'stillimage',
            '-crf', '18',
            '-c:a', 'copy',
            '-shortest',
            '-pix_fmt', 'yuv420p',
            outputPath
        ];

        let converter = new Promise((resolve, reject) => {
            var proc = spawn(cmd, args);

            proc.stdout.on('data', function (data) {
                // console.log(data);
            });

            proc.stderr.setEncoding("utf8")
            proc.stderr.on('data', function (data) {
                // console.log(data);
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
            if (message=='ok'){
                client.query('UPDATE mashup set video_path=$1 where id=$2 and post_link=$3', [outputPath, wallPost[0], wallPost[1]]);
                console.log('Done : '+wallPost[1])
            }else{
                client.query('UPDATE mashup set status=$1 where id=$2 and post_link=$3', ['VIDEO PRODUCT ERROR', wallPost[0], wallPost[1]]);
                console.log('Error: '+wallPost[1])
            } }).catch((reason)=>{
                client.query('UPDATE mashup set status=$1 where id=$2 and post_link=$3', ['VIDEO PRODUCT ERROR', wallPost[0], wallPost[1]]);
                console.log('Error: '+wallPost[1])
            })

    }

})();



