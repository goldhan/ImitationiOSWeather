import React, { useState, useImperativeHandle, Ref, forwardRef, useEffect } from 'react';
import { NavigatorController } from "..";
import CityManager, { City } from "../../utils/cityManager";
import tempCache, { CityTemp } from "../../utils/tempCache";
import Add from '../../res/add_circle_outline_white_24dp.svg';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // dependent on utc plugin
import timezone from 'dayjs/plugin/timezone';

import './index.scss';

dayjs.extend(utc)
dayjs.extend(timezone)
interface Props {
    className?: string,
    onClick?: (City: City) => void
    delHandle?: (City: City) => void
    goto?: (page: string) => void
}
interface _Props extends Props {
    refInstance?: Ref<any>
}


const Index = (prop: _Props) => {
    const { className, delHandle, refInstance, onClick } = prop;
    const [citys, setCitys] = useState<CityTemp[]>([]);
    const [time, setTime] = useState<{ [key: string]: string }>({});
    const [unit, setUnit] = useState<'C' | 'F'>(tempCache.getTempUnit());
    useEffect(() => {
        refresh();
        // NavigatorController.Instance().push('search-view');
        NavigatorController.Instance().cycle((act, from, to, parm) => {
            // console.log(act, from, to, parm);
            if (act === 'pop' && from === 'search-list' && parm) {

            }
        });
    }, [])
    const refresh = () => {
        CityManager.getCitys().then((citys) => {
            tempCache.getDataWithCitys(citys, true).then((r) => setCitys(r));
            const time_: { [key: string]: string } = {};
            citys.forEach((item, index) => {
                if (!time_[item.tz]) {
                    time_[item.tz] = dayjs().tz(item.tz).format('HH:mm');
                }
            })
            setTime(time_);
        });
        setUnit(tempCache.getTempUnit());
    }

    useImperativeHandle(refInstance, () => ({ refresh }));

    const isF = unit === 'F';
    return <div className={`list-container ${className || ''}`}>
        <div className="bg">
            <img alt="bg" src="https://images.unsplash.com/photo-1567266565446-d9c40ccf59a4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" />
        </div>
        <div className="content">
            {citys.map((item, index) => {
                const key = `city-key-${index}`;
                return <div key={key} className="item">
                    <div className="item-del" onClick={() => {
                        CityManager.delCity(item);
                        refresh();
                        if (delHandle) delHandle(item);
                    }}>
                        <p>删除</p>
                    </div>
                    <div className="item-scroll">
                        <div className="item-wrapped">
                            <div className="item-left" onClick={() => {
                                if (onClick) onClick(item)
                                NavigatorController.Instance().pop(null, 'list-view');
                            }}>
                                <img className="item-bg" src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=989&q=80" alt="" />
                                <div className="item-content-wrapped">
                                    <div className="item-content">
                                        <div>
                                            <span className="time">{time[item.tz] || '--'}</span>
                                            <span className="city-name">{item.cityName}</span>
                                        </div>
                                        <div>
                                            <div className="temp">{isF ? item.base.tempF : item.base.temp}°</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="item-right" />
                        </div>
                    </div>
                </div>
            })}
            <div className="set">
                <div className="temp-unit" onClick={() => {
                    const t = unit === "C" ? "F" : "C";
                    tempCache.setTempUnit(t);
                    setUnit(t);
                }}>
                    <span className={isF ? '' : 'active'}>℃</span>/<span className={isF ? 'active' : ''}>℉</span>
                </div>
                <div onClick={() => {
                    NavigatorController.Instance().push('search-view', 'list-view');
                }} ><img alt="add" src={Add} /></div>
            </div>
            <div className="support">
                <img onClick={() => window.open("https://dev.qweather.com/")} alt="hefeng" src="https://www.qweather.com/favicon-32x32.png?v=2021010553" />
            </div>
        </div>
    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
