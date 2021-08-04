import storage from './storage';
import net from "./net";

let Instance: CityManager;

export interface City {
    cityName: string
    cityId: string
    index: number
    isNear: boolean
    utcOffset: string,
    tz:string
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

    getCitys = (): Promise<City[]> => {

        return new Promise((r, e) => {
            if (this.citys.length) {
                r(this.citys);
            } else {
                const l = storage.get('citys');
                if (l) {
                    const { data } = l;
                    this.citys = data;
                    r(this.citys);
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
                const { name, id, tz, utcOffset } = resp.location[0];
                return { cityName: name, cityId: id, isNear: true, index: 0, tz, utcOffset};
            } else {
                return null
            }

        });
    }

}

export default CityManager.Instance();
