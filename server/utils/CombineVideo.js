import { spawn } from 'child_process'
import { Op } from 'sequelize'
import database from '../models';
import config from '../config/config'

const cmd = '/usr/bin/ffmpeg';


const CombineVideo = async () => {

    const wallPosts = await database.mashup.findAll(
        {
            where: {    
                audioPath: {
                    [Op.ne]: null
                },
                imagePath: {
                    [Op.ne]: null
                },
                approve:true,
                status:null,
                videoPath:null
            }
        }
    )
    const progressFinish = wallPosts.length;
    let progressCount = 0;

    for (let wallPost of wallPosts) {
        const downloadDir = `wall${wallPost.publicId}_${wallPost.id}`
        const outputPath = `${config.mashup.downloadDir}/${downloadDir}/${wallPost.id}.mp4`

        const args = [
            '-y',
            '-loop', '1',
            '-framerate', '2',
            '-i', wallPost.imagePath,
            '-i', wallPost.imagePath,
            '-i', wallPost.audioPath,
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
                    videoPath:outputPath
                },{
                    where:{
                        id: wallPost.id,
                        publicId: wallPost.publicId
                    }
                })
                console.log(`Done : ${wallPost.postLink}`)
            } else {
                database.mashup.update({
                    videoPath: '',
                    status: 'VIDEO_CONVERSION_ERROR'
                }, {
                    where: {
                        id: wallPost.id,
                        publicId: wallPost.publicId
                    }
                })
                console.log(`VIDEO_CONVERSION_ERROR: ${wallPost.postLink}`)
            }
        })
        progressCount += 1;
        console.log(progressCount + ' of ' + progressFinish + ' : ' + wallPost.postLink);
    }

}


export default CombineVideo

