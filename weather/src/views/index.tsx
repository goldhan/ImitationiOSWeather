import React, { useEffect, useState, useRef, MutableRefObject } from "react";
import Main from './main';
import List from './list';
import Search from './search';

import './index.scss';


let nav: NavigatorController;
export class NavigatorController {
    views: string[]
    constructor() {
        this.views = [];
    }

    static Instance = () => {
        if (nav) return nav;
        nav = new NavigatorController();
        return nav;
    }

    setRootView = (className:string) => {
        this.views = [className];
    }

    push = (to: string, from?: string, parm?:any) => {
        const toDom = document.getElementsByClassName(to)[0] as HTMLElement;
        const fromDom = document.getElementsByClassName(from || this.views[this.views.length - 1])[0] as HTMLElement;
        toDom.style.top = '0';
        toDom.style.zIndex = '1';
        fromDom.style.zIndex = '0';
        this.views.push(to);
    }

    pop = (parm?:any, from?:string) => {
        if (this.views.length <= 1) return;
        const fromDom = document.getElementsByClassName(from || this.views[this.views.length - 1])[0] as HTMLElement;
        fromDom.style.top = '100%';
        fromDom.style.zIndex = '0';
        this.views.pop();
    }

}

interface RefInterface {
    refresh:()=>void
}
const Index = () => {
    const main = useRef<RefInterface | null>(null);
    const list = useRef<RefInterface | null>(null);
    const nowDisplay = useRef('main-view');
    useEffect(() => {
        NavigatorController.Instance().setRootView('main-view');
        if (main.current) {
            main.current.refresh();
        }
    }, [])

    const goto = (page:string) => {
        const _goto = (className:string) => {
            const to = document.getElementsByClassName(className)[0] as HTMLElement;
            const now = document.getElementsByClassName(nowDisplay.current)[0] as HTMLElement;
            to.style.top = '0';
            to.style.zIndex = '1';
            now.style.zIndex = '0';
            now.style.top = '100%';
            if (className === 'list-view' || className === 'search-view') {
                
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
            case 'Search':
                _goto('search-view');
                // if (list.current) list.current.refresh();
                break;
            default:
                break;
        }
    }





    return <div className="container">
        <div className="main-view"><Main goto={goto} ref={main} /></div>
        <div className="list-view"><List goto={goto} ref={list} onClick={(city) => {
            // goto('Main');
        }}/></div>
        <div className="search-view"><Search goto={goto} ref={list} /></div>
    </div>
}

export default Index;