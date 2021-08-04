import net from './net';
import dayjs from 'dayjs';
import storage from './storage';
import { City } from './cityManager';

import cloudy from '../res/cloudy.jpg';
import heavy_rain from '../res/heavy_rain.jpg';
import light_rain_n from '../res/light_rain_n.jpg';
import light_rain from '../res/light_rain.jpg';
import snow_n from '../res/snow_n.jpg';
import snow from '../res/snow.jpg';
import sunny from '../res/sunny.jpg';
import overcast from '../res/overcast.jpg';
import thunder from '../res/thunder.jpg';

let instance: TempCache;

export interface CityTemp extends City {
    base: BaseInfo
    detail: { name: string, value: string }[]
    days: BaseInfo[]
    hours: BaseInfo[]
    desc: string
    descF: string
    updateTime: number
}

interface BaseInfo {
    text: string
    temp: string
    tempF: string
    icon: string
    windDir: string
    windSpeed: string
    windScale: string
    tempMax: string
    tempMin: string
    tempMaxF: string
    tempMinF: string
    week: string
    hour: string
    iconDay: string
    bg:string
}

const Hour = 1;
const Expired = Hour * 60 * 1000;
class TempCache {
    temp: { [key: string]: CityTemp }
    unit: 'C'|'F'
    static Instance = () => {
        if (instance) return instance;
        instance = new TempCache();
        return instance;
    }

    constructor() {
        this.temp = {};
        this.unit = this.getTempUnit();
    }

    getTempUnit = (): 'C' | 'F' => {
        if (this.unit) {
            return this.unit;
        }
        const u = storage.get('tempUnit')
        if (u) {
            this.unit = u;
            return u;
        }
        this.setTempUnit('C');
        return 'C';
    }

    setTempUnit = (u: 'C' | 'F') => {
        storage.set('tempUnit', u);
        this.unit = u;
    }

    getDataWithCitys = (citys: City[], isIgnoreExpired = false): Promise<CityTemp[]> => {
        const reqs = citys.map((item) => this.getDataWithCity(item, isIgnoreExpired));
        return Promise.all(reqs);
    }

    getDataWithCity = (city: City, isIgnoreExpired = false): Promise<CityTemp> => {
        const cityId = city.cityId;
        const t = this.temp[cityId];
        let isExpired = false;
        if (t && new Date().getTime() - t.updateTime > Expired && !isIgnoreExpired) {
            isExpired = true;
        }
        if (!t || isExpired) {
            return this.getDataWithNet(city).then((r) => {
                this.temp[cityId] = r;
                return r;
            })
        }
        return new Promise((r) => r(t));
    }

    getBg = (code:string):string => {
        const statu = parseInt(code, 10);
        let r = '';
        switch (statu) {
            case 150:
            case 153:
            case 100:
                r = sunny;
                break;
            case 101:
            case 103:
                r = cloudy;
                break;
            case 102:
                r = cloudy;
                break;
            case 104:
            case 154:
                r = overcast;
                break;
            case 300:
            case 301:
            case 302:
            case 303:
            case 304:
                r = thunder;
                break;
            case 305:
            case 309:
                r = light_rain;
                break;
            case 306:
            case 313:
                r = heavy_rain;
                break;
            case 307:
            case 308:
            case 310:
            case 311:
            case 312:
            case 350:
                r = heavy_rain;
                break;
            case 400:
                r = snow;
                break;
            case 401:
            case 407:
                r = snow;
                break;
            case 402:
            case 403:
                r = snow;
                break;
            case 404:
            case 405:
            case 406:
                r = snow;
                break;
            default:
                r = ''
                break;
        }
        return r;
    }

    getDataWithNet = (city: City): Promise<CityTemp> => {
        const getWeek = (date: string): string => {
            const str = dayjs(date).format('d');
            const parm = ["天", "一", "二", "三", "四", "五", "六"]
            // if (date === dayjs().format("YYYY-MM-DD")) {
            //     return '今天';
            // }
            return `星期${parm[parseInt(str, 10)]}`;
        }

        const getTempF = (c:string):string => {
            const t = 32 + parseFloat(c) * 1.8
            return `${t.toFixed(0)}`;
        }
        const detailInfoArr = [
            ["日出", "sunrise"],
            ["日落", "sunset"],
            ["降水概率", ""],
            ["湿度", "humidity"],
            ["风速", "windSpeedDay"],
            ["体感温度", ""],
            ["降水量", "precip"],
            ["气压", "pressure"],
            ["能见度", "vis"],
            ["紫外线指数", "uvIndex"],
        ]
        const cityId = city.cityId;
        const ReqNow = net.getWithApi("/now", { location: cityId });
        const ReqH = net.getWithApi("/24h", { location: cityId });
        const ReqD = net.getWithApi("/10d", { location: cityId });
        return Promise.all([
            ReqNow, ReqH, ReqD
        ]).then(([now, hour, day]) => {
            const r = <CityTemp>{
                base: <BaseInfo>{},
                detail: [],
                days: <BaseInfo[]>[],
                hours: <BaseInfo[]>[],
                desc: '',
                descF: '',
                ...city,
                updateTime: new Date().getTime()
            };
            if (now && now.code === '200') {
                r.base = now.now;
                r.base.tempF = getTempF(r.base.temp);
            }
            if (hour && hour.code === '200') {
                r.hours = hour.hourly.map((item: any) => {
                    return { ...item, hour: item.fxTime.split("T")[1].split(":")[0], tempF: getTempF(item.temp) };
                })
            }
            if (day && day.code === '200') {
                r.days = day.daily.map((item: any) => {
                    return { ...item, week: getWeek(item.fxDate), tempMinF: getTempF(item.tempMin), tempMaxF: getTempF(item.tempMax) }
                });
                // r.detail = day.daily[0];
            }
            if (r.days.length) {
                const [tody] = r.days;
                const { tempMax, tempMin, tempMinF, tempMaxF } = tody;
                r.base.tempMin = tempMin;
                r.base.tempMax = tempMax;
                r.base.tempMinF = tempMinF;
                r.base.tempMaxF = tempMaxF;
                // r.detail.windSpeed = r.base.windSpeed;
            }
            const detail = day.daily[0];
            r.detail = detailInfoArr.map((item, index) => {
                const t = detail as any;
                let value = t[item[1]];
                if (item[1] === 'windSpeedDay') {
                    value = r.base.windSpeed;
                }
                return { name: item[0], value };
            })
            const base = r.base;
            r.base.bg = this.getBg(r.base.icon);
            r.desc = `今天：${base.text}，${base.windDir}${base.windSpeed}公里/小时。最高气温${base.tempMax || '--'}°，最低气温${base.tempMin || '--'}°`;
            r.descF = `今天：${base.text}，${base.windDir}${base.windSpeed}公里/小时。最高气温${base.tempMaxF || '--'}°，最低气温${base.tempMinF || '--'}°`;
            return r;
        })
    }
}

export default TempCache.Instance();