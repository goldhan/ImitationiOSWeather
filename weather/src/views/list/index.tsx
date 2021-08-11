import React, { useState, useImperativeHandle, Ref, forwardRef, useEffect, useCallback, useRef, HtmlHTMLAttributes } from 'react';
import { DragDropContext, Droppable, Draggable, DraggingStyle, NotDraggingStyle, DropResult } from "react-beautiful-dnd";
import { NavigatorController, useNavigatorCycle } from "..";
import CityManager, { City } from "../../utils/cityManager";
import tempCache, { CityTemp } from "../../utils/tempCache";
import { useTranslation } from 'react-i18next';
import Add from '../../res/add_circle_outline_white_24dp.svg';
import nearIcon from '../../res/near_me_white_24dp.svg';
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

// a little function to help us with reordering the result
const reorder = (list: CityTemp[], startIndex: number, endIndex: number): CityTemp[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const Index = (prop: _Props) => {
    const { className, delHandle, refInstance, onClick } = prop;
    const [citys, setCitys] = useState<CityTemp[]>([]);
    const [time, setTime] = useState<{ [key: string]: string }>({});
    const [unit, setUnit] = useState<'C' | 'F'>(tempCache.getTempUnit());
    const [isSort, setIsSort] = useState(false);
    const [bg, setBg] = useState('');
    const { t } = useTranslation();
    const timer = useRef<number>();
    useEffect(() => {
        // refresh();
    }, [])

    useNavigatorCycle((act, from, to, parm) => {
        if (to === 'list-view') {
            setIsSort(false);
            refresh();
            startTimer();
        }
        if (from === 'list-view') {
            stopTimer();
        }
        // console.log(citys)
    }, 'list-view');
    
    useEffect(() => {
        if (citys.length) {
            getTime(citys);
            startTimer();
        }
        return () => {
            stopTimer();
        }
    }, [citys])

    const refresh = () => {

        CityManager.getCitys().then((citys) => {
            tempCache.getDataWithCitys(citys, true).then((r) => {
                setCitys(r);
                const index = Math.floor(Math.random() * r.length);
                setBg(r[index].base.bg);
            })
        });
        setUnit(tempCache.getTempUnit());

    }

    const getTime = (citys:CityTemp[]) => {
        const time_: { [key: string]: string } = {};
        citys.forEach((item, index) => {
            if (!time_[item.tz]) {
                time_[item.tz] = dayjs().tz(item.tz).format('HH:mm');
            }
        })
        setTime(time_);
    }

    const stopTimer = () => {
        if (timer.current) {
            clearInterval(timer.current)
            console.log('stop timer', timer.current);
            timer.current = undefined;
        }
    }

    const startTimer = () => {
        stopTimer();
        timer.current = setInterval(() => {
            getTime(citys);
        }, 3000)
        console.log('start timer',timer.current);
    }

    const onDragEnd = (result: DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        const citys_ = citys.filter((item) => !item.isNear);
        let items = reorder(
            citys_,
            result.source.index,
            result.destination.index
        );
        if (!isSort) setIsSort(true);
        items = [...citys.filter((item) => item.isNear), ...items].map((item, index) => ({...item, index}));
        setCitys(items);
    }

    const resetItemScroll = () => {
        const dom = document.getElementsByClassName('item-scroll')
        for (const key in dom) {
            if (Object.prototype.hasOwnProperty.call(dom, key)) {
                const element = dom[key];
                element.scrollTo(0, 0);
            }
        }
    }

    const getItemDom = (item: CityTemp) => <div>
        <div className="item-del" onClick={(e) => {
            CityManager.delCity(item);
            refresh();
            if (delHandle) delHandle(item);
            resetItemScroll();
        }}>
            <p>{t('del')}</p>
        </div>
        <div className={`item-scroll ${item.index}`} style={{ overflowX: item.isNear ? 'hidden' : 'scroll' }}>
            <div className="item-wrapped">
                <div className="item-left" onClick={() => {
                    if (isSort) {
                        CityManager.updateCitysStorage(citys);
                    }
                    if (onClick) onClick(item)
                    resetItemScroll();
                    NavigatorController.Instance().pop(null, 'list-view');
                }}>
                    <img className="item-bg" src={item.base.bg} alt="" />
                    <div className="item-content-wrapped">
                        <div className="item-content">
                            <div>
                                <span className="time">
                                    {time[item.tz] || '--'}
                                    {item.isNear ? <img className="near" src={nearIcon} alt="near" /> : null}
                                </span>
                                <span className="city-name">
                                    {item.cityName}
                                    <span>{`${item.adm2 === item.cityName ? item.adm1 : item.adm2}`}</span>
                                </span>
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

    useImperativeHandle(refInstance, () => ({ refresh }));

    const nearItems = citys.filter((item) => item.isNear);
    const nearItem = nearItems.length ? nearItems[0] : undefined;
    const citys_ = citys.filter((item) => !item.isNear);

    const isF = unit === 'F';
    return <div className={`list-container ${className || ''}`}>
        <div className="bg">
            <img alt="bg" src={bg} />
        </div>
        <div className="content">
            {nearItem ? <div className="item">{getItemDom(nearItem)}</div> : null}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {citys_.map((item, index) => {
                                const key = `city-key-${index}`;
                                return <Draggable key={key} draggableId={key} index={index} isDragDisabled={item.isNear} disableInteractiveElementBlocking={item.isNear}>
                                    {(provided, snapshot) => (
                                        
                                        <div
                                            className="item"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ userSelect: "none", ...provided.draggableProps.style}}
                                        >
                                            {getItemDom(item)}
                                        </div>
                                    )}
                                </Draggable>
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
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
