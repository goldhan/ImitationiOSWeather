import net from './net';
import dayjs from 'dayjs';
import CityManager, { City } from './cityManager';

let instance: TempCache;

export interface CityTemp extends City {
    base: BaseInfo
    detail: DetailInfo
    days: BaseInfo[]
    hours: BaseInfo[]
    updateTime: number
}

interface BaseInfo {
    text: string
    temp: string
    icon: string
    windDir: string
    windSpeed: string
    windScale: string
    tempMax: string
    tempMin: string
    week: string
    hour: string
    iconDay: string
}

interface DetailInfo {
    sunrise: string
    sunset: string
    humidity: string
    windSpeed: string
    precip: string
    pressure: string
    vis: string
    uvIndex: string
}
const Hour = 1;
const Expired = Hour * 60 * 1000;
class TempCache {
    temp: { [key: string]: CityTemp }
    static Instance = () => {
        if (instance) return instance;
        instance = new TempCache();
        return instance;
    }

    constructor() {
        this.temp = {};
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
        const cityId = city.cityId;
        const ReqNow = net.getWithApi("/now", { location: cityId });
        const ReqH = net.getWithApi("/24h", { location: cityId });
        const ReqD = net.getWithApi("/10d", { location: cityId });
        return Promise.all([
            ReqNow, ReqH, ReqD
        ]).then(([now, hour, day]) => {
            const r = <CityTemp>{
                base: <BaseInfo>{},
                detail: <DetailInfo>{},
                days: <BaseInfo[]>[],
                hours: <BaseInfo[]>[],
                ...city,
                updateTime: new Date().getTime()
            };
            if (now && now.code === '200') {
                r.base = now.now;
            }
            if (hour && hour.code === '200') {
                r.hours = hour.hourly.map((item: any) => ({ ...item, hour: item.fxTime.split("T")[1].split(":")[0]}))
            }
            if (day && day.code === '200') {
                r.days = day.daily.map((item: any) => ({ ...item, week: getWeek(item.fxTime) }));
                r.detail = day.daily[0];
            }
            if (r.days.length) {
                const [tody] = r.days;
                const { tempMax, tempMin } = tody;
                r.base.tempMin = tempMin;
                r.base.tempMax = tempMax;
                r.detail.windSpeed = r.base.windSpeed;
            }
            return r;
        })
    }
}

export default TempCache.Instance();