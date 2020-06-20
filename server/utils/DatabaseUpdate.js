import easyvk from 'easyvk'
import database from '../models';
import config from '../config/config'
import readline from 'readline'

function getImageUrl(ImageArray) {
    // old algo for extract photo key
    // let photoKey = Object.keys(ImageArray).reduce(function (accumulator, current) {
    //     if (current.includes('photo')) {
    //         let res = parseInt(current.split('_')[1]);
    //         let prevRes = parseInt(accumulator.split('_')[1]);
    //         if (res > prevRes) {
    //             accumulator = current;
    //         }
    //     }
    //     return accumulator;
    // }, 'photo_0')
    let imageUrl = ''
    if (ImageArray.length) {
        let photoKey = ImageArray.length - 1
        imageUrl = ImageArray[photoKey].url;
    }
    return imageUrl
}

function getInfoFromVkPostObject(vkPostObject) {
    let info
    let attachments

    // Если это репост на стену, вся инфа об attachment хранится в copy_history
    if ("attachments" in vkPostObject) {
        attachments = vkPostObject.attachments
    }else{
        if ("copy_history" in vkPostObject && vkPostObject.copy_history.length > 0 && "attachments" in vkPostObject.copy_history[0]){
            attachments = vkPostObject.copy_history[0].attachments
        }
    }

    // Пока что обрабатываем только посты вида (картинка + одно аудио) - остальные 
    // (видео, видео+аудио, гиф+аудио, плейлист или картинка или несколько аудио - отбрасываем)
    // В будущем добавим
    if (attachments && attachments.length === 2) {
        let audioInfo;
        let imageInfo;
        for (let attachment of attachments) {
            if (attachment.type === "audio") {
                audioInfo = attachment.audio;
            } else if (attachment.type === "photo") {
                imageInfo = getImageUrl(attachment.photo.sizes)
            }
        }
        if (audioInfo !== undefined && imageInfo !== undefined) {
            info = {
                id: vkPostObject.id,
                publicId: vkPostObject.from_id,
                postLink: 'https://vk.com/wall' + vkPostObject.from_id + '_' + vkPostObject.id,
                imageUrl: imageInfo,
                author: audioInfo.artist,
                title: audioInfo.title,
                likes: vkPostObject.likes.count,
                postDate: parseInt(vkPostObject.date) * 1000
            }
        }
    }


    return info

}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const captchaHandler = ({ captcha_sid, captcha_img, resolve: solve, vk }) => {

    rl.question(`Введите капчу для картинки ${captcha_img} `, (key) => {

        // Когда вводится капча в консоль, пробуем решить капчу
        solve(key).then(() => {

            console.log('Капча решена корректно!')

        }).catch(({ err, reCall: tryNewCall }) => {

            // Иначе капча не решена, стоит попробовать снова
            console.log('Капче не решена!!!\nПробуем занова')

            tryNewCall() // Пробуем снова, занова запускаем наш captchaHandler, по факту...

            // Не стоит самостоятельно перезапускать функцию captchaHandler, так как в EasyVK
            // для этого имеется функция reCall, которая точно запустит все как нужно

        })

    })

}

function DatabaseUpdate() {
    easyvk({
        username: config.mashup.vk.phone,
        password: config.mashup.vk.password,
        session_file: config.mashup.vk.sessionFile,
        captchaHandler: captchaHandler
    }).then(async vk => {
        let continueSearch = true
        let offset = 0

        while (continueSearch) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            let vkr = await vk.call('wall.get', {
                domain: "mashup",
                count: "100",
                offset: offset
            });

            if (vkr.count - offset > 100 || offset < vkr.count) {
                offset += 100;
            } else {
                continueSearch = false;
            }

            for (let wallPost of vkr.items) {
                if (wallPost.marked_as_ads === 0) {
                    let postInDb = await database.mashup.findOne({
                        where: {
                            id: wallPost.id,
                            publicId: wallPost.from_id
                        }
                    })
                    let newPost = getInfoFromVkPostObject(wallPost)
                    if (newPost) {
                        if (!postInDb) {
                            await database.mashup.create(newPost)
                        } else {
                            let updateArgs = { likes: newPost.likes }
                            if (postInDb.postDate === null) {
                                updateArgs.postDate = newPost.postDate
                            }
                            await database.mashup.update(updateArgs, {
                                where: {
                                    id: postInDb.id,
                                    publicId: postInDb.publicId
                                }
                            })
                        }
                    }
                }
            }
        }
    })


}


export default DatabaseUpdate

