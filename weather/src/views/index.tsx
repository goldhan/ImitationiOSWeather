import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import Main from './main';
import List from './list';

import './index.scss';

interface RefInterface {
    refresh:()=>void
}
const Index = () => {
    const main = useRef<RefInterface | null>(null);
    const list = useRef<RefInterface | null>(null);
    const nowDisplay = useRef('main-view');
    useEffect(() => {
        if (main.current) {
            main.current.refresh();
        }
    }, [])

    const goto = (page:string) => {
        const _goto = (className:string) => {
            const to = document.getElementsByClassName(className)[0] as HTMLElement;
            const go = document.getElementsByClassName(nowDisplay.current)[0] as HTMLElement;
            to.style.top = '0';
            to.style.zIndex = '1';
            go.style.zIndex = '0';
            if (nowDisplay.current !== 'main-view') {
                go.style.top = '100%';
            }
            nowDisplay.current = className;
        }
        switch (page) {
            case 'Main':
                _goto('main-view');
                // if (main.current) main.current.refresh();
                break;
            case 'List':
                _goto('list-view');
                if (list.current) list.current.refresh();
                break;
            default:
                break;
        }
    }



    return <div className="container">
        <div className="main-view"><Main goto={goto} ref={main} /></div>
        <div className="list-view"><List goto={goto} ref={list} onClick={(city) => {
            goto('Main');
        }}/></div>
    </div>
}

export default Index;