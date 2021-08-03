import React, { useEffect, useState, useImperativeHandle, Ref, forwardRef } from "react";
import Detail from '../detail';
import CityManager, { City } from "../../utils/cityManager";
import { NavigatorController } from "..";
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';
import listIcon from '../../res/list_white_24dp.svg';
import nearIcon from '../../res/near_me_white_24dp.svg';
import 'swiper/swiper.scss';
import './index.scss';
interface Props {
    className?: string,
    goto?: (page: string) => void
}
interface _Props extends Props {
    refInstance?: Ref<any>
}

const Index = (prop: _Props) => {
    const { goto, className, refInstance } = prop;
    const [citys, setCitys] = useState<City[]>([]);
    const [selected, setSelected] = useState(0);
    const [swiper, setSwiper] = useState<SwiperClass | null>(null);
    const [isGetCityFail, setIsGetCityFail] = useState(false);
    useEffect(() => {
        //    refresh();
        NavigatorController.Instance().cycle((act, from, to, parm) => {
            console.log(act, from, to, parm);
        });
    }, []);
    const refresh = () => {
        CityManager.getCitys().then((citys) => setCitys(citys)).catch((e) => {
            // alert('获取定位失败');
            setIsGetCityFail(true);
            NavigatorController.Instance().push('search-view');
        });
        setIsGetCityFail(true);
    }
    const slideTo = (index: number) => {
        if (swiper) {
            swiper.slideTo(index);
        }
    }
    useImperativeHandle(refInstance, () => ({ refresh, slideTo }));


    return <div className={`main-container ${className || ''}`}>
        {citys.length ? <React.Fragment>
            <div className="main-background">
                <img src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=989&q=80" alt="" />
            </div>
            <div className="main">
                <Swiper
                    className="swiper"
                    onSwiper={(s) => { if (s) setSwiper(s) }}
                    onSlideChange={(swiper) => setSelected(swiper.activeIndex)}
                >
                    {citys.map((item, index) => {
                        const key = `detail-key-${index}`;
                        const { cityId, cityName, isNear } = item;
                        return <SwiperSlide key={key}><Detail cityId={cityId} cityName={cityName} index={index} isNear={isNear} /></SwiperSlide>
                    })}
                </Swiper>
            </div>
            <div className="bottom">
                <div>
                    <div className="support">
                        <img alt="hefeng" src="https://www.qweather.com/favicon-32x32.png?v=2021010553" />
                    </div>
                    <div className="page">
                        <div onClick={() => {
                            if (swiper) {
                                swiper.slidePrev();
                            }
                        }} />
                        <div className="points">
                            {citys.map((item, index) => {
                                const key = `point-key-${index}`;
                                return <div key={key} onClick={() => {
                                    slideTo(index);
                                }}>
                                    {item.isNear ? <img className={selected === index ? "point selected" : 'point'} alt="near" src={nearIcon} /> : <div className={selected === index ? "point selected" : 'point'} />}
                                </div>
                            })}
                        </div>
                        <div onClick={() => {
                            if (swiper) {
                                swiper.slideNext();
                            }
                        }} />
                    </div>
                    <div className="menu" onClick={() => {
                        // if (goto) goto('List')
                        NavigatorController.Instance().push('list-view');
                    }}>
                        <img alt="list" src={listIcon} />
                    </div>
                </div>
            </div>
        </React.Fragment> : <div className="status">
            {isGetCityFail ? <div onClick={() => {
                NavigatorController.Instance().push('search-view');
            }}>
                获取定位失败，点击搜索城市
                </div> : "Loading......"}
        </div>}

    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
