import { Task } from "actionhero"
import { spawn, exec } from 'child_process'
import { Op } from 'sequelize'
import database from '../models'
import config from '../config/config'
import fs from 'fs'

export class MyTask extends Task {
  constructor() {
    super();
    this.name = "CombineVideo";
    this.description = "an actionhero task";
    this.frequency = 0;
    this.queue = "default";
    this.middleware = [];
  }

  async run(data) {
    api.log('start')   
    await CombineVideo()
    api.log('end')
  }
}


const cmd = '/usr/bin/ffmpeg';

const executeShellCommand = (command)=>{
    return new Promise((resolve)=>{
        exec(command, (err, stdout, stderr) => {
            if (err) {
                let errorMessage = { code: err.code, message: `SHELL_COMMAND_ERROR: ${err.message}`  };
                throw errorMessage
            } else {
                if (stderr){
                    let errorMessage = { code: 1, message: `SHELL_COMMAND_ERROR: ${stderr}`  };
                    throw errorMessage
                }
                resolve (stdout)
            }
        });
    })
   
}

const generateCombineFile = async (videoPath, audioPath, outputFile) => {
    const audioDuration = await executeShellCommand(`ffprobe -i ${audioPath} -show_entries format=duration -v quiet -of csv="p=0"`)
    const videoDuration = await executeShellCommand(`ffprobe -i ${videoPath} -show_entries format=duration -v quiet -of csv="p=0"`)
    const videoCount = Math.ceil(audioDuration/videoDuration)
    
    const combineFile = await fs.createWriteStream(outputFile)
    for (let i =0;i<videoCount;i++){
        await combineFile.write(`file ${videoPath}\n`,'utf-8')
    }
    await combineFile.end()       
}

const getConverter = (args) => {
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
    return converter
}

const processJpg = (output, inputImage, inputAudio) => {
    const args = [
        '-y',
        '-loop', '1',
        '-framerate', '2',
        '-i', inputImage,
        '-i', inputImage,
        '-i', inputAudio,
        '-filter_complex', '[0:v]gblur=sigma=40,scale=2000x2000,crop=w=1280:h=720,setsar=1,setdar=16/9[v0];[1:v]scale=w=-1:h=\'min(720\\, ih*3/2)\'[v1a];[v1a]scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1[v1b];[v0][v1b]overlay=(W-w)/2:(H-h)/2,crop=w=1280:h=720',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-tune', 'stillimage',
        '-crf', '18',
        '-c:a', 'copy',
        '-shortest',
        '-pix_fmt', 'yuv420p',
        output
    ]
    return getConverter(args)

}
const processMP4Loop = async (output, inputImage, inputAudio,tempFile) => {
    await generateCombineFile(inputImage,inputAudio,tempFile)
    const args = [
        '-y',
        '-i', inputAudio,
        '-f', 'concat',
        '-safe','0',
        '-i', tempFile,
        '-filter_complex', '[1:v]gblur=sigma=40,scale=2000x2000,crop=w=1280:h=720,setsar=1,setdar=16/9[v0];[1:v]scale=w=-1:h=\'min(720\\, ih*3/2)\'[v1a];[v1a]scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1[v1b];[v0][v1b]overlay=(W-w)/2:(H-h)/2,crop=w=1280:h=720',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-tune', 'film',
        '-crf', '25',
        '-c:a', 'copy',
        '-shortest',
        '-pix_fmt', 'yuv420p',
        output
    ]
    return getConverter(args)
}
const processGif = (output, inputImage, inputAudio) => {
    const args = [
        '-y',
        '-i', inputAudio,
        '-ignore_loop','0',
        '-i', inputImage,     
        '-filter_complex', '[1:v]gblur=sigma=40,scale=2000x2000,crop=w=1280:h=720,setsar=1,setdar=16/9[v0];[1:v]scale=w=-1:h=\'min(720\\, ih*3/2)\'[v1a];[v1a]scale=2*trunc(iw/2):2*trunc(ih/2),setsar=1[v1b];[v0][v1b]overlay=(W-w)/2:(H-h)/2,crop=w=1280:h=720',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-tune', 'film',
        '-crf', '25',
        '-c:a', 'copy',
        '-shortest',
        '-pix_fmt', 'yuv420p',
        output
    ]
    return getConverter(args)

}


const CombineVideo = async () => {
    return new Promise(async(resolve,reject)=>{
        const wallPosts = await database.mashup.findAll(
            {
                where: {
                    audioPath: {
                        [Op.ne]: null
                    },
                    imagePath: {
                        [Op.ne]: null
                    },
                    approve: true,
                    status: null,
                    videoPath: null
                }
            }
        )
        const progressFinish = wallPosts.length;
        let progressCount = 0;
    
        for (let wallPost of wallPosts) {
            debugger    
            const downloadDir = `wall${wallPost.publicId}_${wallPost.id}`
            const outputPath = `${config.mashup.downloadDir}/${downloadDir}/${wallPost.id}.mp4`
            let converter
            if (wallPost.imageExt === 'jpg') {
                converter = processJpg(outputPath, wallPost.imagePath, wallPost.audioPath)
            } else if (wallPost.imageExt === 'gif/mp4') {
                let tempFile = `${config.mashup.downloadDir}/${downloadDir}/temp.txt`
                converter = processMP4Loop(outputPath, wallPost.imagePath, wallPost.audioPath,tempFile)
            } else if (wallPost.imageExt === 'gif'){
                converter = processGif(outputPath, wallPost.imagePath, wallPost.audioPath)
            }
            await converter.then((message) => {
                if (message == 'ok') {
                    database.mashup.update({
                        videoPath: outputPath
                    }, {
                        where: {
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
        resolve("Done")
    })
}

