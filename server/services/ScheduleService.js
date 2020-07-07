import cron from 'node-cron'
import dbUpdate from '../utils/DatabaseUpdate'
import vkDownload from '../utils/DownloadFromVk'
import CombineVideo from '../utils/CombineVideo'
import UploadVideoToYoutube from '../utils/UploadVideoToYoutube'
import Quota from '../utils/Quota'

function ScheduleService() {
    let quota = new Quota()
    quota.date=new Date()

    let updateDBTask = cron.schedule('0 0 * * *', () => {        
        quota.date = new Date()
        dbUpdate().then(
            console.log('update db finish')
        )
    })
    let uploadTask = cron.schedule('*/30 * * * *', () => {
        if (quota.dailyQuota < quota.dailyQuotaLimit) {
            if (updateDBTask.getStatus() !== 'running') {
                vkDownload(quota).then(() => {
                    CombineVideo().then(() => {
                        UploadVideoToYoutube(quota).then(()=>{console.log('upload complete')}).catch((err)=>{
                            quota.uploadLimitExceeded=true
                        })
                    })
                })
            }
        }else{
            uploadTask.stop()
        }
    })

    updateDBTask.start()
    uploadTask.start()
}

export default ScheduleService