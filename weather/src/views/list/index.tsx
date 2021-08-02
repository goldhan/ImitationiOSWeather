import React, { useState, useImperativeHandle, Ref, forwardRef } from 'react';
import CityManager, { City } from "../../utils/cityManager";
import Add from '../../res/add_circle_outline_white_24dp.svg';

import './index.scss';
interface Props {
    className?: string,
    onClick?:(City:City) => void
    goto: (page: string) => void
}
interface _Props extends Props {
    refInstance?: Ref<any>
}


const Index = (prop: _Props) => {
    const { className, goto, refInstance, onClick } = prop;
    const [citys, setCitys] = useState<City[]>([]);
    const refresh = () => {
        CityManager.getCitys().then((citys) => setCitys(citys));
    }
    useImperativeHandle(refInstance, () => ({ refresh }));


    return <div className={`list-container ${className || ''}`}>
        <div className="bg">
            <img alt="bg" src="https://images.unsplash.com/photo-1567266565446-d9c40ccf59a4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" />
        </div>
        <div className="content">
            {citys.map((item, index) => {
                const key = `city-key-${index}`;
                return <div key={key} className="item"  onClick={() => {if (onClick) onClick(item)}}>
                    <img className="item-bg" src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=989&q=80" alt="" />
                    <div className="item-content-wrapped">
                        <div className="item-content">
                            <div>
                                <span className="time">13:55</span>
                                <span className="city-name">{item.cityName}</span>
                            </div>
                            <div>
                                <span className="temp">26°</span>
                            </div>
                        </div>
                    </div>
                </div>
            })}
            <div className="set">
                <div>
                    <span>℃</span>/<span>℉</span>
                </div>
                <div><img alt="add" src={Add} /></div>
            </div>
        </div>
    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
