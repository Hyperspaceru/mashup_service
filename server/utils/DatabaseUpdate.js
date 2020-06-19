import easyvk from 'easyvk'
import cliProgress from 'cli-progress'
import database from '../models';
import config from '../config/config'

function getImageUrl(ImageArray){
    let photoKey = Object.keys(ImageArray).reduce(function (accumulator, current) {
        if (current.includes('photo')) {
            let res = parseInt(current.split('_')[1]);
            let prevRes = parseInt(accumulator.split('_')[1]);
            if (res > prevRes) {
                accumulator = current;
            }
        }
        return accumulator;
    }, 'photo_0')
    let imageUrl = ImageArray[photoKey];
    return imageUrl
}

function DatabaseUpdate(){
    easyvk({
        username: config.mashup.vk.phone,
        password: config.mashup.vk.password,
        session_file: '../config/credentials/.my-session'
    }).then(async vk => {
        const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        let continueSearch = true
        let offset = 0
    
        while (continueSearch) {
    
            await new Promise(resolve => setTimeout(resolve, 5000));
            let { vkr } = await vk.call('wall.get', {
                domain: "mashup",
                count: "100",
                offset: offset
            });
            if (offset===0){
                await progress.start(vkr.count, 0);
            }
            if (vkr.count - offset > 100 || offset < vkr.count) {
                offset += 100;
            } else {
                continueSearch = false;
            }
    
            for (let wallPost of vkr.items) {
                if (wallPost.marked_as_ads === 0) {
                    let existInDB = false;
                    await console.log('https://vk.com/wall' + wallPost.from_id + '_' + wallPost.id);
                    if (typeof(wallPost.attachments) == "undefined"){
                        if (typeof( wallPost.copy_history) != "undefined"){
                            wallPost = wallPost.copy_history[0]}
                    }
                    const postInDb = await database.mashup.findOne({
                        where:{
                            id:wallPost.id,
                            publicId:wallPost.from_id
                        }
                    })
                    await client
                        .query("SELECT * FROM mashup WHERE id = $1 and post_link = $2", [wallPost.id,'https://vk.com/wall' + wallPost.from_id + '_' + wallPost.id])
                        .then((result) => { if (result.rowCount > 0) existInDB = true})
                        .catch(e => console.error(e.stack))
                    if (!existInDB) {                 
                        if (typeof(wallPost.attachments) != "undefined" && wallPost.attachments.length > 0 && wallPost.attachments.length <= 2) {
                            let audioAttachment;
                            let imageAttachment;
                            for (let attachment of wallPost.attachments) {
                                if (attachment.type === "audio") {
                                    audioAttachment = attachment.audio;
                                } else if (attachment.type === "photo") {
                                    imageAttachment = getImageUrl(attachment.photo)
                                } 
                            }
                            if (audioAttachment !== undefined && imageAttachment !== undefined) {
                                let id = wallPost.id
                                let publicId = wallPost.from_id
                                let postLink = 'https://vk.com/wall' + wallPost.from_id + '_' + wallPost.id
                                let imageUrl = imageAttachment
                                let author = audioAttachment.artist
                                let title = audioAttachment.title
                                
    
    
                                
    
                                await client.query('INSERT INTO mashup (id,author,post_link,title,image_url,image_path) VALUES ($1,$2,$3,$4,$5,$6)',
                                    [id, author, post_link, title, image_url, image_path])
                            }
                        }
                    }
                }
            }
            await progress.update(100);
        }
        await client.end();
        await progress.stop();
    })
    

}


export default DatabaseUpdate

