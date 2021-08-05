import storage from './storage';
import net from "./net";
import configManager from './configManager';
import gkLog from './gkLog';

let Instance: CityManager;

export interface City {
    cityName: string
    cityId: string
    index: number
    isNear: boolean
    utcOffset: string,
    tz:string
    adm1:string
    adm2:string
    country:string,
    lang:string
}

class CityManager {
    citys: City[]

    static Instance = (): CityManager => {
        if (Instance) return Instance;
        Instance = new CityManager();
        return Instance;
    }

    constructor() {
        this.citys = [];
    }

    addCity = (city: City) => {
        const filter = this.citys.filter((item) => item.cityId !== city.cityId);
        this.citys = [...filter, { ...city, index: filter.length }];
        storage.set('citys', { data: this.citys });
    }

    delCity = (city: City) => {
        this.citys = this.citys.filter((item) => item.cityId !== city.cityId);
        storage.set('citys', { data: this.citys });
    }

    updateNearCity = (): Promise<boolean> => {
        return this.getLocation().then((l) => {
           return this.getCityWithLocation(l).then((city) => {
                if (city) {
                    if (this.citys.length === 0) {
                        this.citys = [city];
                    } else if (this.citys[0].isNear) {
                        this.citys[0] = city;
                    } else {
                        this.citys = [city, ...this.citys];
                    }
                    storage.set('citys', { data: this.citys });
                    return true;
                }
                return false;
           }).catch((err) => {
               return false;
           });
        }).catch((err) => {
            return false;
        });
    }

    getCitys = (): Promise<City[]> => {
        return new Promise((r, e) => {
            if (this.citys.length) {
                r(this.citys);
            } else {
                const l = storage.get('citys');
                if (l) {
                    const { data } = l;
                    this.citys = data;
                    // 每次都会刷新一次位置信息
                    this.updateNearCity().then((isOk) => { 
                        // 检查下是否需要更新下城市信息，主要是当切换语言时候，城市信息也应该需要刷新
                        if (configManager.isNeedUpdateCityInfoCache()) {
                            this.updateCitys(this.citys).then((resp) => {
                                this.citys = this.citys.map((item) => {
                                    const n = resp[item.cityId];
                                    return {
                                        ...item,
                                        ...n,
                                    };
                                });
                                storage.set('citys', { data: this.citys });
                                r(this.citys);
                            });
                        } else {
                            r(this.citys);
                        }
                    })
                } else {
                    this.getLocation().then((l) => {
                        this.getCityWithLocation(l).then((city) => {
                            if (city) {
                                const t = [city];
                                storage.set('citys', { data: t });
                                this.citys = t;
                                r(t);
                            }
                        }).catch(e);
                    }).catch(e);
                }
            }
        });
    }

    updateCitys = (citys: City[]):Promise<{[key:string]:City}> => {
        const lang = configManager.getLang();
        const citys_ = citys.filter((item) => item.lang !== lang);
        const reqs = citys_.map((item) => net.searchCity(item.cityId));
        return Promise.all(reqs).then((resps) => {
            const r: { [key: string]: City } = {};
            resps.forEach((resp, index) => {
                if (resp.code === '200' && resp.location && resp.location.length) {
                    const [item] = resp.location;
                    const { name, id, tz, utcOffset, adm1, adm2, country } = item;
                    r[id] = { cityName: name, cityId: id, isNear: citys[index].isNear, index, tz, utcOffset, adm1, adm2, country, lang};
                } else {
                    gkLog.error(resp.code)
                }
            })
            return r;
        });
    }

    getLocation = (): Promise<{ [key: string]: string }> => {
        return new Promise((r, e) => {
            const l = storage.get('Location');
            if (l) {
                r(l);
            } else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((res) => {
                        const { latitude, longitude } = res.coords;
                        const d = {
                            latitude: `${latitude}`,
                            longitude: `${longitude}`,
                        };
                        storage.set('Location', d);
                        r(d);
                    }, (err) => {
                        e(err);
                    });
                } else {
                    e('不支持定位');
                }
            }
        })

    }

    getCityWithLocation = (loc: { [key: string]: string }): Promise<City | null> => {
        const { latitude, longitude } = loc;
        return net.getWithApi('/city/lookup', { location: `${longitude},${latitude}` }, true).then((resp) => {
            if (resp.code === '200' && resp.location && resp.location.length) {
                const { name, id, tz, utcOffset, adm1, adm2, country } = resp.location[0];
                return { cityName: name, cityId: id, isNear: true, index: 0, tz, utcOffset, adm1, adm2, country, lang: configManager.getLang()};
            } else {
                return null
            }

        });
    }

}

export default CityManager.Instance();
