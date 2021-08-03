import React, { useEffect, useRef, useState } from "react";
import tempCache, { CityTemp } from "../../utils/tempCache";
import './index.scss';

const HFICONURL = "https://raw.githubusercontent.com/qwd/WeatherIcon/master/weather-icon-S2/64"; // /105.png

interface Props {
    cityName: string,
    cityId: string,
    index: number,
    isNear: boolean
}

const Index = (prop: Props) => {
    const { cityName, cityId, index, isNear } = prop;
    const isFloat = useRef(false);
    const [data, setData] = useState<CityTemp>({
        updateTime: 0,
        cityName,
        cityId,
        index,
        isNear,
        base: {
            text: '--',
            temp: '--',
            icon: '--',
            windDir: '--',
            windSpeed: '--',
            windScale: '--',
            tempMax: '--',
            tempMin: '--',
            week: '--',
            hour: '--',
            iconDay: '--',
        },
        detail: {
            sunrise: '--',
            sunset: '--',
            humidity: '--',
            windSpeed: '--',
            precip: '--',
            pressure: '--',
            vis: '--',
            uvIndex: '--',
        },
        days: [],
        hours: [],
    });
    const domTemp = useRef<{ [key: string]: HTMLElement }>({});
    const lastScrollTop = useRef(0);
    const lastInnerHeight = useRef(window.innerHeight);
    useEffect(() => {
        getData(cityId);
        window.onresize = () => {
            if (lastInnerHeight.current !== window.innerHeight && lastInnerHeight.current <= 750) {
                window.location.reload();
            }
            lastInnerHeight.current = window.innerHeight;
        }
    }, [cityId]);
    useEffect(() => {
        domTemp.current = {};
    }, [data]);
    // console.log($.scrollTo)
    const getData = (cityId: string) => {
        tempCache.getDataWithCity({ cityName, cityId, index, isNear }).then((r) => {
            setData(r);
        })
    }

    const getDomWithClassName = (className: string): HTMLElement => {
        let dom = domTemp.current[className];
        if (dom) {
            return dom;
        }
        dom = document.getElementsByClassName(`${className} index-${index}`)[0] as HTMLElement;
        domTemp.current[className] = dom;
        return dom;
    }
    const domHeightTemp = useRef<{ [key: string]: number }>({});
    const getDomHeight = (className: string): number => {
        let h = domHeightTemp.current[className];
        if (h) {
            return h;
        }
        const dom = getDomWithClassName(className);
        domHeightTemp.current[className] = dom.clientHeight;
        return dom.clientHeight;
    }
    const lastContainerScrollTop = useRef(0);
    const containerOnScroll = (ev: React.UIEvent<React.ReactNode>) => {
        if (ev.target) {
            const target = ev.target as HTMLElement;

            const temperature = getDomWithClassName('head-temperature');
            const containerHead = getDomWithClassName('container-head');
            const detailTody = getDomWithClassName('detail-tody');
            const detailScrollWrapped = getDomWithClassName('detail-scroll-wrapped');

            const temperatureH = getDomHeight('head-temperature');
            const detailHeadH = getDomHeight('detail-head');
            const detailTodyH = getDomHeight('detail-tody');
            const detailContainerH = getDomHeight('detail-container');

            const isScrollUp = lastContainerScrollTop.current - target.scrollTop < 0;
            lastContainerScrollTop.current = target.scrollTop;
            const marginTop = 30;
            // const h = (temperatureH + marginTop)/2;
            const h = temperatureH;
            const p = 1 - target.scrollTop / h;
            // console.log(target.scrollTop)
            // if (isFloat.current && isScrollUp) {

            // }
            if (p < 0) {
                temperature.style.opacity = "0";
                detailTody.style.opacity = "0";
                containerHead.style.marginTop = "0";
            } else {
                temperature.style.opacity = `${p}`;
                detailTody.style.opacity = `${p}`;
                containerHead.style.marginTop = `${p * 10}px`;
            }



            if (target.scrollTop < h && isFloat.current) {
                isFloat.current = false;
                // floatDetail.style.marginTop = `${containerHeadH}px`;
                detailScrollWrapped.style.overflow = 'hidden';
            }

            if (isScrollUp && target.scrollTop >= h && !isFloat.current) {
                isFloat.current = true;
                target.scrollTo(0, h);
                // floatDetail.style.marginTop = `${marginTop}px`;
                detailScrollWrapped.style.height = `${detailContainerH - detailHeadH - detailTodyH - marginTop}px`;
                detailScrollWrapped.style.overflow = 'auto';
                // temperature.style.opacity = "0";
                // detailTody.style.opacity = "0";
            }
        }
    }

    const detailOnScroll = (ev: React.UIEvent<React.ReactNode>) => {
        if (ev.target) {
            const target = ev.target as HTMLElement;
            const containerScroll = getDomWithClassName('container-scroll');
            // const floatDetail = getDomWithClassName('float-detail');
            // const containerHeadH = getDomHeight("container-head");
            const isScrollUp = lastScrollTop.current - target.scrollTop < 0;
            lastScrollTop.current = target.scrollTop;

            if (target.scrollTop <= 0) {
                // floatDetail.style.marginTop = `${containerHeadH/2}px`;
                containerScroll.style.overflow = 'auto';
                // target.style.overflow = 'hidden';
            }
            if (isScrollUp && target.scrollTop) {
                containerScroll.style.overflow = 'hidden';
            }

        }
    }

    // base: BaseInfo
    // detail: DetailInfo
    // days: BaseInfo[]
    // hours: BaseInfo[]
    // updateTime: number
    const { base, detail, days, hours } = data;

    const todayData = days && days[0] ? days[0] : base;
    const detailInfoArr = [
        ["日出", "sunrise"],
        ["日落", "sunset"],
        ["降水概率", ""],
        ["湿度", "humidity"],
        ["风速", "windSpeedDay"],
        ["体感温度", ""],
        ["降水量", "precip"],
        ["气压", "pressure"],
        ["能见度", "vis"],
        ["紫外线指数", "uvIndex"],
    ]

    return <div className={`detail-container index-${index}`}>
        <div className={`container-head index-${index}`}>
            <p className="head-location">{cityName || '--'}</p>
            <p className="head-status">{base.text || '--'}</p>
            <p className={`head-temperature index-${index}`}>{base.temp || '--'}°</p>
        </div>
        <div className={`container-scroll index-${index}`} onScroll={containerOnScroll}>
            <div className="float-detail">
                <div className={`detail-tody index-${index}`}>
                    <div className="detail-tody-wrapped">
                        <div className="tody-time">{`${todayData.week} 今天`}</div>
                        <div className="tody-temp">
                            {todayData.tempMax}<span>{todayData.tempMin}</span>
                        </div>
                    </div>
                </div>
                <div className={`detail-head index-${index}`}>
                    <div className="content">
                        {hours.map((item, index) => {
                            const key = `detail-head-key-index-${index}`;
                            return <div key={key} className="hour">
                                <div>{item.hour}时</div>
                                <div>
                                    <img src={`${HFICONURL}/${item.icon}.png`} alt="icon" />
                                </div>
                                <div>
                                    {item.temp}°
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
            <div className={`detail-scroll-wrapped index-${index}`} onScroll={detailOnScroll}>
                {/* <div className="space" /> */}
                <div className="detail-scroll">
                    <div className="detail-space" />
                    <div className="detail-content">
                        <div className="day">
                            {days.map((item, index) => {
                                const key = `day-key-index-${index}`;

                                if (index === 0) return null;
                                return <div key={key} className="day-item">
                                    <div className="item-wrapped">
                                        <div className="time">{item.week}</div>
                                        <div className="icon">
                                            <img src={`${HFICONURL}/${item.iconDay}.png`} alt="icon" />
                                        </div>
                                        <div className="temp">
                                            {item.tempMax}<span>{item.tempMin}</span>
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                        <div className="desc">
                            今天：{`${base.text}`}，{`${base.windDir}`}{`${base.windSpeed}`}公里/小时。最高气温{`${base.tempMax || '--'}`}°，最低气温{`${base.tempMin || '--'}`}°
                        </div>
                        <div className="other">
                            {detailInfoArr.map((item, index) => {
                                const key = `info-key-index-${index}`;
                                const t = detail as any;
                                return <div key={key} className="info-item">
                                    <div className="item-wrapped">
                                        <span>{item[0]}:</span>
                                        <span>{t[item[1]]}</span>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Index;
