import axios from 'axios';
import gkLog from './gkLog';
import configManager from './configManager';

const HFAPIKEY = import.meta.env.VITE_APIKEY;
const HFAPIURL = import.meta.env.VITE_HFAPIURL;
const HFAPIGEO = import.meta.env.VITE_HFAPIGEO;
// const HFICONURL = "https://raw.githubusercontent.com/qwd/WeatherIcon/master/weather-icon-S2/64"; // /105.png
let Instance: any;

console.log(import.meta.env.APIKEY);
class Net {

    static Instance = ():Net => {
        if (Instance) return Instance;
        Instance = new Net();
        return Instance
    }


    getWithApi = (api:string, parm?: {[key:string]:any}, isGEOApi = false):Promise<any> => {
        let url = HFAPIURL;
        if (isGEOApi) {
            url = HFAPIGEO;
        }
        let parmStr = `?key=${HFAPIKEY}`;
        if (parm) {
            for (const key in parm) {
                if (Object.prototype.hasOwnProperty.call(parm, key)) {
                    const element = parm[key];
                    parmStr += `&${key}=${element}`;
                }
            }
        }
    
        const lanParm = `&lang=${configManager.getLang()}`;
        return this.get(`${url}${api}${parmStr}${lanParm}`);
    }

    searchCity = (value:string):Promise<any> => {
        return this.getWithApi('/city/lookup', { location: value }, true);
    }

    get = (url:string):Promise<any> => {
        gkLog.log('↑',url);
        return axios.get(url, {timeout: 60000}).then((r) => {
            gkLog.log('↓', url, '\n', r.data);
            return r.data;
        }).catch((err) => {
            if (err) {
                gkLog.error('net err',err);
            }
        })
    }

}

export default Net.Instance();
