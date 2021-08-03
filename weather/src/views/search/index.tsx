import React, { useState, useImperativeHandle, Ref, forwardRef } from 'react';
import CityManager, { City } from "../../utils/cityManager";
import { NavigatorController } from "..";
import Search from '../../res/search_white_24dp.svg';

import './index.scss';
import { useEffect } from 'react';
interface Props {
    className?: string,
    onClick?:(City:City) => void
    goto?: (page: string) => void
}
interface _Props extends Props {
    refInstance?: Ref<any>
}


const Index = (prop: _Props) => {
    const { className, goto, refInstance, onClick } = prop;
    const [citys, setCitys] = useState<City[]>([]);
    const refresh = () => {
        // CityManager.getCitys().then((citys) => setCitys(citys));
    }
    useImperativeHandle(refInstance, () => ({ refresh }));

    useEffect(() => {
        NavigatorController.Instance().cycle((act, from, to, parm) => {
            console.log(act, from, to, parm);
        });
    }, [])


    return <div className={`list-container ${className || ''}`}>
        <div className="bg">
            <img alt="bg" src="https://images.unsplash.com/photo-1567266565446-d9c40ccf59a4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" />
        </div>
        <div className="content">
            <div className="head">
                <span>输入城市、邮政编码或机场位置</span>
                <div>
                    <img alt="search" src={Search}/>
                    <input />
                    <div onClick={() => { 
                        // if (goto) goto('List')
                        NavigatorController.Instance().pop(null, 'search-view');
                        }}>取消</div>
                </div>
            </div>
            <div className="result">

            </div>
        </div>
    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
