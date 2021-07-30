const tools = {

    /**
     * 隐藏敏感信息
     * @param text 
     * @param maxLength 
     * @param format 
     * @returns 
     */
    encodeString(text: string, maxLength = 15, format = '...'): string {
        if (text.length < maxLength && text.length > 5) {
            return `${text.slice(0, 2)}${format}`
        } else if (text.length > 15) {
            return `${text.slice(0, 5)}${format}${text.slice(text.length - 5, text.length)}`
        } else {
            return format
        }
    },

    /**
     * 正则匹配域名
     * @param text 
     * @returns 
     */
    getDomainStr(text: string): string {
        if (text) {
            const r = text.match("^((http://)|(https://))?([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}(/)")
            if (r?.length) {
                let s = r[0]
                s = s.replace("http://", '')
                s = s.replace("https://", '')
                s = s.replace("wss://", '')
                return s
            }
            if (text.length) {
                let s = text;
                s = s.replace("http://", '')
                s = s.replace("https://", '')
                s = s.replace("wss://", '')
                return s
            }
            return text
        }
        return ''
    },

    getIcoWithDomain(url?: string): string {
        if (url) {
            return `https://www.google.com/s2/favicons?domain=${this.getDomainStr(url)}`
        }
        return '';
    }

}

export default tools
