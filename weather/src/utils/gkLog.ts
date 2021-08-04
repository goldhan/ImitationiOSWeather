import dayjs from 'dayjs';
class GKLog {
  log_ (text: string, obj: any) {
    console.log(`** ${text} ${dayjs().format('HH:mm:ss')} ****`)
    console.log(...obj)
  }

  log (...obj:any) {
    this.log_('log', obj)
  }

  error (...obj:any) {
    this.log_('❌❌❌ ERROR!!!', obj)
  }

  warn (...obj: any) {
    this.log_('⚠️⚠️⚠️ Warning', obj)
  }

  success (...obj: any) {
    this.log_('😀 Successful!', obj)
  }

  fail (...obj: any) {
    this.log_('🥺 Fail!', obj)
  }

  tip (...obj: any) {
    this.log_('🤔 Tip', obj)
  }
}

export default new GKLog()
