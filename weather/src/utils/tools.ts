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
    },

    isObject(value:any):boolean {
        const type = typeof value;
        return value != null && (type === 'object' || type === 'function');
    },

    /**
 * 创建一个 debounced（防抖动）函数，该函数会从上一次被调用后，延迟 wait 毫秒后调用 func 方法。
 * debounced（防抖动）函数提供一个 cancel 方法取消延迟的函数调用以及 flush 方法立即调用。
 * 可以提供一个 options（选项） 对象决定如何调用 func 方法，options.leading 与|或 options.trailing 决定延迟前后如何触发（是 先调用后等待 还是 先等待后调用）。
 * func 调用时会传入最后一次提供给 debounced（防抖动）函数 的参数。 后续调用的 debounced（防抖动）函数返回是最后一次 func 调用的结果。
 * @param {function} func 要防抖动的函数
 * @param {number} wait 需要延迟的毫秒数
 * @param {Object} options
 * [options.leading=false] (boolean): 指定在延迟开始前调用
 * [options.maxWait] (number): 设置 func 允许被延迟的最大值
 * [options.trailing=true] (boolean): 指定在延迟结束后调用
 */
    debounce(func: any, wait: number, options: { [key: string]: number | boolean }) {
        let lastArgs: any[] | undefined;
        let lastThis: any;
        let maxWait: number | undefined;
        let result: any;
        let timerId: number | undefined;
        let lastCallTime: number | undefined;

        let lastInvokeTime = 0;
        let leading = false;
        let maxing = false;
        let trailing = true;

        if (typeof func !== 'function') {
            throw new TypeError('Expected a function');
        }
        wait = +wait || 0;
        if (this.isObject(options)) {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time: number) {
            const args = lastArgs;
            const thisArg = lastThis;

            lastArgs = undefined;
            lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function startTimer(pendingFunc: TimerHandler, time: number | undefined) {
            return setTimeout(pendingFunc, time);
        }

        function cancelTimer(id: number | undefined) {
            clearTimeout(id);
        }

        function trailingEdge(time: number) {
            timerId = undefined;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = undefined;
            lastThis = undefined;
            return result;
        }

        function remainingWait(time: number) {
            const timeSinceLastCall = time - lastCallTime!;
            const timeSinceLastInvoke = time - lastInvokeTime;
            const timeWaiting = wait - timeSinceLastCall;

            return maxing ? Math.min(timeWaiting, maxWait! - timeSinceLastInvoke) : timeWaiting;
        }

        function shouldInvoke(time: number) {
            const timeSinceLastCall = time - lastCallTime!;
            const timeSinceLastInvoke = time - lastInvokeTime;

            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
                (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait!));
        }

        function timerExpired() {
            const time = Date.now();
            if (shouldInvoke(time)) {
                trailingEdge(time);
            } else {
                // Restart the timer.
                timerId = startTimer(timerExpired, remainingWait(time));
            }
        }

        function leadingEdge(time: number) {
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = startTimer(timerExpired, wait);
            // Invoke the leading edge.
            return leading ? invokeFunc(time) : result;
        }

        function cancel() {
            if (timerId !== undefined) {
                cancelTimer(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = undefined;
            lastCallTime = undefined;
            lastThis = undefined;
            timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function pending() {
            return timerId !== undefined;
        }

        const debounced = (...args: any[]) => {
            const time = Date.now();
            const isInvoking = shouldInvoke(time);

            lastArgs = args;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxing) {
                    // Handle invocations in a tight loop.
                    timerId = startTimer(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined) {
                timerId = startTimer(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        debounced.pending = pending;
        return debounced;
    },

    /**
     * 创建一个节流函数，在 wait 秒内最多执行 func 一次的函数。
     * 该函数提供一个 cancel 方法取消延迟的函数调用以及 flush 方法立即调用。
     * 可以提供一个 options 对象决定如何调用 func 方法， options.leading 与|或 options.trailing 决定 wait 前后如何触发。
     * func 会传入最后一次传入的参数给这个函数。 随后调用的函数返回是最后一次 func 调用的结果。
     * @param {function} func 要防抖动的函数
     * @param {number} wait 需要延迟的毫秒数
     * @param {Object} options
     * [options.leading=false] (boolean): 指定在延迟开始前调用
     * [options.trailing=true] (boolean): 指定在延迟结束后调用
     */
    throttle(func: any, wait: number, options: { [key: string]: number | boolean }) {
        let leading = true;
        let trailing = true;

        if (typeof func !== 'function') {
            throw new TypeError('Expected a function');
        }
        if (this.isObject(options)) {
            leading = 'leading' in options ? !!options.leading : leading;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }
        return this.debounce(func, wait, {
            leading,
            trailing,
            maxWait: wait
        });
    },

}

export default tools
