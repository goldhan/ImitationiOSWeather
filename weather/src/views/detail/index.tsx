import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import net from "../../utils/net";
import './index.scss';
const TESTCity = "101280601";
const HFICONURL = "https://raw.githubusercontent.com/qwd/WeatherIcon/master/weather-icon-S2/64"; // /105.png


const Index = () => {
    const isFloat = useRef(false);
    const itemTop = useRef<{ [key: string]: HTMLElement }>({});
    const [nowData, setNowData] = useState<{ [key: string]: any }>({});
    const [hourData, setHourData] = useState<{ [key: string]: any }[]>([]);
    const [dayData, setDayData] = useState<{ [key: string]: any }[]>([]);
    const domTemp = useRef<{ [key: string]: HTMLElement }>({});
    const lastScrollTop = useRef(0);
    useEffect(() => {
        getData();
    }, []);
    useEffect(() => {
        domTemp.current = {};
        // const scroll = getDomWithClassName('detail');
        // if (scroll) {
        //     scroll.scrollTo(0, 0);
        // }
        // updateDomOffsetTops();
    }, [nowData, hourData, dayData]);
    // console.log($.scrollTo)
    const getData = () => {
        net.getWithApi("/now", { location: TESTCity }).then((r) => {
            if (r.code === '200') {
                setNowData(r.now);
            }
        });
        net.getWithApi("/24h", { location: TESTCity }).then((r) => {
            if (r.code === '200') {
                setHourData(r.hourly);
            }
        });
        net.getWithApi("/10d", { location: TESTCity }).then((r) => {
            if (r.code === '200') {
                setDayData(r.daily);
            }
        }).finally(() => {
            // updateDomOffsetTops();
        });
    }


    const updateDomOffsetTops = () => {
        const scroll = getDomWithClassName('detail');
        scroll.style.overflow = 'hidden';
        if (scroll) {
            scroll.scrollTo(0, 0);
        }
        const arr = document.getElementsByClassName('day-item');
        if (arr) {
            for (let index = 0; index < arr.length; index++) {
                const element = arr[index] as HTMLElement;
                itemTop.current[`${element.offsetTop}`] = element
            }
        }
        scroll.style.overflow = 'auto';
    }

    const getDomWithClassName = (className: string): HTMLElement => {
        let dom = domTemp.current[className];
        if (dom) {
            return dom;
        }
        dom = document.getElementsByClassName(className)[0] as HTMLElement;
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
            const detailTody = getDomWithClassName('detail-tody');
            const detailScrollWrapped = getDomWithClassName('detail-scroll-wrapped');

            const containerHeadH = getDomHeight("container-head");
            const temperatureH = getDomHeight("head-temperature");
            const detailHeadH = getDomHeight('detail-head');
            const detailTodyH = getDomHeight('detail-tody');
            const detailContainerH = getDomHeight('detail-container');

            const h = temperatureH + 30;
            const p = 1 - target.scrollTop / h;
            if (p < 0) {
                temperature.style.opacity = "0";
                detailTody.style.opacity = "0";
            } else {
                temperature.style.opacity = `${p}`;
                detailTody.style.opacity = `${p}`;
            }
            const isScrollUp = lastContainerScrollTop.current - target.scrollTop < 0;
            lastContainerScrollTop.current = target.scrollTop;
            if (target.scrollTop < h) {
                isFloat.current = false;
                detailScrollWrapped.style.overflow = 'hidden';
            }
            if (isScrollUp && target.scrollTop >= h) {
                isFloat.current = true;
                target.scrollTo(0, h);
                detailScrollWrapped.style.height = `${detailContainerH - (containerHeadH - h) - detailHeadH - detailTodyH}px`;
                detailScrollWrapped.style.overflow = 'auto';
            }
        }
    }

    const detailOnScroll = (ev: React.UIEvent<React.ReactNode>) => {
        if (ev.target) {
            const target = ev.target as HTMLElement;
            const containerScroll = getDomWithClassName('container-scroll');
            const isScrollUp = lastScrollTop.current - target.scrollTop < 0;
            lastScrollTop.current = target.scrollTop;

            if (target.scrollTop <= 0) {
                containerScroll.style.overflow = 'auto';
            }
            if (isScrollUp) {
                containerScroll.style.overflow = 'hidden';
            }
            
        }
    }

    const todayData = dayData[0] || {};
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

    const getWeek = (date: string): string => {
        const str = dayjs(date).format('d');
        const parm = ["天", "一", "二", "三", "四", "五", "六"]
        // if (date === dayjs().format("YYYY-MM-DD")) {
        //     return '今天';
        // }
        return `星期${parm[parseInt(str, 10)]}`;
    }

    return <div className="detail-container">
        <div className="container-head">
            <p className="head-location">福田区</p>
            <p className="head-status">{nowData.text || '--'}</p>
            <p className="head-temperature">{nowData.temp || '--'}°</p>
        </div>
        <div className="container-scroll" onScroll={containerOnScroll}>
            <div className="float-detail">
                <div className="detail-tody">
                    <div className="detail-tody-wrapped">
                        <div className="tody-time">{`${getWeek(todayData.fxDate)} 今天`}</div>
                        <div className="tody-temp">
                            {todayData.tempMax}<span>{todayData.tempMin}</span>
                        </div>
                    </div>
                </div>
                <div className="detail-head">
                    <div className="content">
                        {hourData.map((item, index) => {
                            const key = `detail-head-key-${index}`;
                            const time = item.fxTime.split("T")[1].split(":")[0];
                            return <div key={key} className="hour">
                                <div>{time}时</div>
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
            <div className="detail-scroll-wrapped" onScroll={detailOnScroll}>
                {/* <div className="space" /> */}
                <div className="detail-scroll">
                    <div className="detail-space" />
                    <div className="detail-content">
                        <div className="day">
                            {dayData.map((item, index) => {
                                const key = `day-key-${index}`;
                                const time = getWeek(item.fxDate);
                                if (index === 0) return null;
                                return <div key={key} className="day-item">
                                    <div className="item-wrapped">
                                        <div className="time">{time}</div>
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
                            今天：{`${nowData.text}`}，{`${nowData.windDir}`}{`${nowData.windSpeed}`}公里/小时。最高气温{`${todayData.tempMax || '--'}`}°，最低气温{`${todayData.tempMin || '--'}`}°
                        </div>
                        <div className="other">
                            {detailInfoArr.map((item, index) => {
                                const key = `info-key-${index}`;
                                return <div key={key} className="info-item">
                                    <div className="item-wrapped">
                                        <span>{item[0]}:</span>
                                        <span>{todayData[item[1]]}</span>
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