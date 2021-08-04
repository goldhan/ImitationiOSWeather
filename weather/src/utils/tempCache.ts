import net from './net';
import dayjs from 'dayjs';
import storage from './storage';
import CityManager, { City } from './cityManager';

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
                    return { ...item, week: getWeek(item.fxTime), tempMinF: getTempF(item.tempMin), tempMaxF: getTempF(item.tempMax) }
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
            r.desc = `今天：${base.text}，${base.windDir}${base.windSpeed}公里/小时。最高气温${base.tempMax || '--'}°，最低气温${base.tempMin || '--'}°`;
            r.descF = `今天：${base.text}，${base.windDir}${base.windSpeed}公里/小时。最高气温${base.tempMaxF || '--'}°，最低气温${base.tempMinF || '--'}°`;
            return r;
        })
    }
}

export default TempCache.Instance();