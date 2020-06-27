import cron from 'node-cron'
import dbUpdate from '../utils/DatabaseUpdate'
import vkDownload from '../utils/DownloadFromVk'
import CombineVideo from '../utils/CombineVideo'
import UploadVideoToYoutube from '../utils/UploadVideoToYoutube'

function ScheduleService(){
    // dbUpdate()
    // vkDownload()
    // CombineVideo()
    UploadVideoToYoutube()
}

export default ScheduleService