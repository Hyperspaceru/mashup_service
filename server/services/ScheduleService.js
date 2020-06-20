import cron from 'node-cron'
import dbUpdate from '../utils/DatabaseUpdate'
import vkDownload from '../utils/DownloadFromVk'

function ScheduleService(){
    dbUpdate()
    // vkDownload()
}

export default ScheduleService