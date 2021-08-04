import React, { useState, useImperativeHandle, Ref, forwardRef, useRef, useEffect } from 'react';
import CityManager, { City } from "../../utils/cityManager";
import { NavigatorController } from "..";
import net from '../../utils/net';
import Search from '../../res/search_white_24dp.svg';
import Tools from '../../utils/tools';

import './index.scss';

interface Props {
    className?: string,
    onClick?: (City: City) => void
    goto?: (page: string) => void
}
interface _Props extends Props {
    refInstance?: Ref<any>
}


const Index = (prop: _Props) => {
    const { className, goto, refInstance, onClick } = prop;
    const [citys, setCitys] = useState<City[]>([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const search_ = (value: string) => {
        net.getWithApi('/city/lookup', { location: value }, true).then((resp) => {
            if (resp.code === '200' && resp.location && resp.location.length) {
                const r: City[] = resp.location.map((item: any, index: number) => {
                    const { name, id, tz, utcOffset, adm1, adm2, country } = item;
                    return { cityName: name, cityId: id, isNear: false, index, tz, utcOffset, adm1, adm2, country };
                })
                setCitys(r);
            } else {
                setCitys([]);
            }
        }).finally(() => setIsLoading(false));
    }

    const search = useRef(Tools.debounce(search_, 500, {}));

    useEffect(() => {
    }, [])


    const inputSearch = (e: { target: { value: any; }; }) => {
        let { value } = e.target;
        value = value.trim();
        setSearchText(value);
        if (value.length > 1) {
            setIsLoading(true);
            search.current(value);
        } else {
            setCitys([]);
        }
    };

    const red = (keyValue:string, sourceValue:string):string  => {
        let value = keyValue.toUpperCase();
        const t = sourceValue.toUpperCase();
        const sourceValue_ = t.replace(value, '@');
        let arr = sourceValue_.split('@');
        if (arr.length <= 1) {
            value = keyValue.toLowerCase();
            arr = sourceValue_.split('@');
        }
        if (arr.length > 1) {
            const [left, right] = arr;
            return `${left || ''}<span class="red">${value}</span>${right || ''}`;
        }
        return sourceValue;
    }

    let tip = '';
    if (searchText.length === 1) {
        tip = '输入字符过少';
    }
    if (searchText.length >= 2 && citys.length === 0 && !isLoading ) {
        tip = '无记录';
    }
    if (isLoading) {
        tip = '正在验证中';
    }

    return <div className={`search-container ${className || ''}`}>
        <div className="bg">
            <img alt="bg" src="https://images.unsplash.com/photo-1567266565446-d9c40ccf59a4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" />
        </div>
        <div className="content">
            <div className="head">
                <span>输入城市、邮政编码或机场位置</span>
                <div>
                    <div className="input">
                        <img alt="search" src={Search} />
                        <input type="text"
                            onChange={inputSearch}
                            value={searchText} />
                    </div>
                    <div onClick={() => {
                        NavigatorController.Instance().pop(null, 'search-view');
                    }}>取消</div>
                </div>
            </div>
            <div className="result">
                <div className="result-item">
                    <p>{tip}</p>
                </div>
                {citys.map((item:any, index) => {
                    const key = `r-${index}`;
                    const { adm1, adm2, country, cityName } = item;
                    return <div className="result-item" key={key} onClick={() => {
                        CityManager.addCity(item);
                        if (onClick) onClick(item);
                        setCitys([]);
                        setSearchText('');
                        NavigatorController.Instance().pop(null, 'search-view');
                        
                    }}>
                        <p dangerouslySetInnerHTML={{ __html: red(searchText, cityName) }} />
                        <span dangerouslySetInnerHTML={{ __html: red(searchText, `${country} ${adm1} ${adm2}`) }} />
                    </div>
                })}
            </div>
        </div>
    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
