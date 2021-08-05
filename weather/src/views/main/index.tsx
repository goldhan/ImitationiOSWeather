import React, { useEffect, useState, useImperativeHandle, Ref, forwardRef, useRef } from "react";
import Detail from '../detail';
import CityManager, { City } from "../../utils/cityManager";
import tempCache from "../../utils/tempCache";
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
interface RefInterface {
    refresh: () => void
}

const Index = (prop: _Props) => {
    const { goto, className, refInstance } = prop;
    const [citys, setCitys] = useState<City[]>([]);
    const [selected, setSelected] = useState(0);
    const [swiper, setSwiper] = useState<SwiperClass | null>(null);
    const [isGetCityFail, setIsGetCityFail] = useState(false);
    const [unit, setUnit] = useState<'C'|'F'>(tempCache.getTempUnit());
    const [bgs, setBgs] = useState<{[key:string]:string}>({});
    const viewRefs = useRef<{ [key: string]: RefInterface}>({});
    useEffect(() => {
        refreshSubView(selected);
    }, [citys]);
    const refresh = () => {
        CityManager.getCitys().then((citys) => {
            setCitys(citys);
        }).catch((e) => {
            // alert('获取定位失败');
            setIsGetCityFail(true);
            NavigatorController.Instance().push('search-view');
        });
        setUnit(tempCache.getTempUnit());
    }
    const refreshSubView = (index:number) => {
        if (citys.length) {
            const ref = viewRefs.current[citys[index].cityId]
            if (ref) {
                ref.refresh();
            }
        }
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
                <img src={bgs[citys[selected].cityId]} alt="" />
                {/* <img src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=989&q=80" alt="" /> */}
            </div>
            <div className="main">
                <Swiper
                    className="swiper"
                    cssMode
                    onSwiper={(s) => { if (s) setSwiper(s) }}
                    onSlideChange={(swiper) => {
                        setSelected(swiper.activeIndex);
                        refreshSubView(swiper.activeIndex);
                    }}
                >
                    {citys.map((item, index) => {
                        const key = `detail-key-${index}`;
                        // const { cityId, cityName, isNear } = item;
                        return <SwiperSlide key={key}><Detail ref={(r: RefInterface) => {viewRefs.current[item.cityId] = r}} city={item} unit={unit} onLoaded={(cityTemp) => {
                            setBgs((old) => {
                                const n = {...old};
                                n[cityTemp.cityId] = cityTemp.base.bg;
                               if (!n[cityTemp.cityId]) {
                                   console.log(cityTemp.base.icon, '没有背景')
                               }
                                return n;
                            })
                        }}/></SwiperSlide>
                    })}
                </Swiper>
            </div>
            <div className="bottom">
                <div>
                    <div className="support" onClick={() => window.open("https://dev.qweather.com/")}>
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
                {isGetCityFail ? '获取定位失败，点击搜索城市' : ''}
            </div> : "Loading......"}
        </div>}

    </div>
}

export default forwardRef((props: Props, ref: Ref<any>) => <Index {...props} refInstance={ref} />);
