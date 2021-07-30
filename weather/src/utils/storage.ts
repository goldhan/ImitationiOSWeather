const s = {
    /**
    * 判断是否支持 localStorage
    * 在 safari 隐身模式下不支持 sessionStorage 和 localStorage
    */
    isLocalStorageEnabled() {
        try {
            localStorage.setItem('__testItem__', '_test');
            localStorage.removeItem('__testItem__');
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
    * 判断是否支持 sessionStorage
    * 在 safari 隐身模式下不支持 sessionStorage 和 localStorage
    */
    isSessionStorageEnabled() {
        try {
            sessionStorage.setItem('__testItem__', '_test');
            sessionStorage.removeItem('__testItem__');
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * 设置存储数据
     * @param {string} key 键
     * @param {any} value 值
     * @param {bool} isSession 是否使用session
     */
    set(key: string, value: any, isSession?: boolean) {
        if (value || value === 0) {
            value = typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
        }
        if (isSession && this.isSessionStorageEnabled()) {
            sessionStorage.setItem(key, value);
        } else if (this.isLocalStorageEnabled()) {
            localStorage.setItem(key, value);
        }
    },

    /**
     * 获取存储数据
     * @param {string} key 键
     * @param {bool} isSession 是否使用session
     */
    get(key: string, isSession?: boolean) {
        let value;
        if (isSession && this.isSessionStorageEnabled()) {
            const temp = sessionStorage.getItem(key);
            if (temp) {
                value = temp.indexOf('[') > -1 || temp.indexOf('{') > -1 ? JSON.parse(temp) : temp.trim();
            }
        } else if (this.isLocalStorageEnabled()) {
            const temp = localStorage.getItem(key);
            if (temp) {
                value = temp.indexOf('[') > -1 || temp.indexOf('{') > -1 ? JSON.parse(temp) : temp.trim();
            }
        }
        if (!value && value !== 0) {
            return null;
        }
        try {
            if (typeof value !== 'object') {
                value = JSON.parse(value);
            }
        } catch (e) {
            //
        }
        return value;
    },

    /**
     * 删除存储数据
     * @param {string} key 键
     * @param {bool} isSession 是否使用session
     */
    remove(key: string, isSession?: boolean) {
        if (isSession && this.isSessionStorageEnabled()) {
            sessionStorage.removeItem(key);
        } else {
            localStorage.removeItem(key);
        }
    },
};

export default s
