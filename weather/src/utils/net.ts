import axios from 'axios';
import gkLog from './gkLog';

const isEnvPro = false;
const HFAPIKEY = "eb3f2048fd264f6cbc6f49be9d472b9d";
const HFAPIURLPRO = "https://api.qweather.com/v7/weather";
const HFAPIURLDEV = "https://devapi.qweather.com/v7/weather";
const HFICONURL = "https://raw.githubusercontent.com/qwd/WeatherIcon/master/weather-icon-S2/64"; // /105.png
let Instance: any;
class Net {

    static Instance = ():Net => {
        if (Instance) return Instance;
        Instance = new Net();
        return Instance
    }

    constructor() {

    }

    getWithApi = (api:string, parm?: {[key:string]:any}):Promise<any> => {
        const url = isEnvPro ? HFAPIURLPRO : HFAPIURLDEV;
        let parmStr = `?key=${HFAPIKEY}`;
        if (parm) {
            for (const key in parm) {
                if (Object.prototype.hasOwnProperty.call(parm, key)) {
                    const element = parm[key];
                    parmStr += `&${key}=${element}`;
                }
            }
        }
        
        return this.get(`${url}${api}${parmStr}`);
    } 

    get = (url:string):Promise<any> => {
        gkLog.log('req: ', url);
        return axios.get(url, {timeout: 60000}).then((r) => {
            gkLog.log('rep: ', url, '\n', r.data);
            return r.data;
        }).catch((err) => {
            if (err) {
                gkLog.error('net err',err);
            }
        })
    }

}

export default Net.Instance();
