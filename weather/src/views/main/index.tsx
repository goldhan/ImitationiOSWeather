import React, { useEffect, useState } from "react";
import Detail from '../detail';
import net from "../../utils/net";
import storage from '../../utils/storage';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';
import listIcon from '../../res/list_white_24dp.svg';
import nearIcon from '../../res/near_me_white_24dp.svg';
import 'swiper/swiper.scss';
import './index.scss';
interface Props {
    className: string,
    goto: (page:string)=>void
}
const Index = (prop: Props) => {
    const { goto, className } = prop;
    const [citys, setCitys] = useState<{ [key: string]: string | boolean }[]>([]);
    const [selected, setSelected] = useState(0);
    const [swiper, setSwiper] = useState<SwiperClass | null>(null);
    useEffect(() => {
        getStorageData();
    }, []);

    const getStorageData = () => {
        const l = storage.get('citys');
        if (l) {
            const {data} = l;
            setCitys(data);
        } else {
            getLocation();
        }
    }

    const getLocation = () => {
        const l = storage.get('Location');
        if (l) {
            getCityWithLocation(l);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((res) => {
                    const { latitude, longitude } = res.coords;
                    const r = {
                        latitude: `${latitude}`,
                        longitude: `${longitude}`,
                    };
                    storage.set('Location', r);
                    getCityWithLocation(r);
                }, (err) => {

                });
            } else {
            }
        }
    }

    const getCityWithLocation = (loc: { [key: string]: string }) => {
        const { latitude, longitude } = loc;
        const {data: citys} = storage.get('citys') || {data:[]};
        net.getWithApi('/city/lookup', { location: `${longitude},${latitude}` }, true).then((resp) => {
            if (resp.code === '200' && resp.location && resp.location.length) {
                const { name, id } = resp.location[0];
                const city = {cityName: name, cityId: id, isNear: true};
                let citysTemp = [city];
                if (citys.length) {
                    if (citys[0].isNear) {
                        citys[0] =  city
                        citysTemp = citys;
                    } else {
                        citysTemp = [
                            city,
                            ...citys
                        ];
                    }
                }
                storage.set('citys',{data: citysTemp});
                setCitys(citysTemp);
            }
            
        });
    }

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
                        const { cityId, cityName } = item;
                        return <SwiperSlide key={key}><Detail cityId={cityId as string} cityName={cityName as string} index={index} /></SwiperSlide>
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
                                    if (swiper) {
                                        swiper.slideTo(index);
                                    }
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
                    <div className="menu" onClick={() => {if (goto) goto('List')}}>
                        <img alt="list" src={listIcon} />
                    </div>
                </div>
            </div>
        </React.Fragment> : <div className="status">
            Loading......
        </div>}

    </div>
}

export default Index;