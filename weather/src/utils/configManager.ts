import i18n from '../locales/i18';
import storage from './storage';

let Instance:ConfigManager;
class ConfigManager {
    static Instance = ():ConfigManager => {
        if (Instance) return Instance;
        Instance = new ConfigManager();
        return Instance;
    }

    getLang = ():string => {
        let lan = i18n.language || 'en';
        if (lan === 'zh-CN') {
            lan = 'zh';
        }
        return lan;
    }

    isNeedUpdateCityInfoCache = ():boolean => {
        const citys = storage.get('citys');
        if (citys) {
            const {data} = citys;
            const [d] = data;
            if (d) {
                if (d.lang !== this.getLang()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


}

export default ConfigManager.Instance();