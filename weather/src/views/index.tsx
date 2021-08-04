import React, { useEffect, useState, useRef, ReactElement } from "react";
import Main from './main';
import List from './list';
import Search from './search';

import './index.scss';

type actionFunc = (action: string, from?: string, to?: string, parm?: any) => void

let nav: NavigatorController;

export const useNavigatorCycle = (func: actionFunc, name:string) => {
    NavigatorController.Instance().cycle(name, func);
}

export class NavigatorController {
    views: string[]
    cycleFuncs: {[key:string]: actionFunc}
    constructor() {
        this.views = [];
        this.cycleFuncs = {};
    }

    static Instance = () => {
        if (nav) return nav;
        nav = new NavigatorController();
        return nav;
    }

    setRootView = (className?: string) => {
        if (className) {
            this.views = [className];
            return
        }
        this.views = [this.getRootView()];
    }

    cycle = (from:string,func: actionFunc) => {
        this.cycleFuncs[from] = func;
    }

    push = (to: string, from?: string, parm?: any) => {
        if (this.views.length == 0) this.setRootView();
        const toDom = document.getElementsByClassName(to)[0] as HTMLElement;
        if (from && this.views[this.views.length - 1] !== from) {
            this.views.push(from);
        }
        from = from || this.views[this.views.length - 1];
        const fromDom = document.getElementsByClassName(from)[0] as HTMLElement;
        toDom.style.top = '0';
        toDom.style.zIndex = '1';
        fromDom.style.zIndex = '0';
        this.views.push(to);
        for (const key in this.cycleFuncs) {
            if (Object.prototype.hasOwnProperty.call(this.cycleFuncs, key)) {
                const act = this.cycleFuncs[key];
                act('push', from, to, parm);
            }
        }
    }

    pop = (parm?: any, from?: string) => {
        if (this.views.length === 0) {
            this.setRootView();
        }
        if (from && this.views[this.views.length - 1] !== from) {
            this.views.push(from);
        }
        if (this.views.length === 1) return;
        from = from || this.views[this.views.length - 1];
        const fromDom = document.getElementsByClassName(from)[0] as HTMLElement;
        fromDom.style.top = '100%';
        fromDom.style.zIndex = '0';
        this.views.pop();
        for (const key in this.cycleFuncs) {
            if (Object.prototype.hasOwnProperty.call(this.cycleFuncs, key)) {
                const act = this.cycleFuncs[key];
                act('pop', from, this.views[this.views.length - 1], parm);
            }
        }
    }

    getRootView = (): string => {
        return document.getElementsByClassName('nav')[0].children[0].className;
    }

    createNavigatorController = (views: ReactElement[]) => {
        this.setRootView(views[0].props.className || '');
        return <div className="container nav">
            {views}
        </div>
    }
}

interface RefInterface {
    refresh: () => void
    slideTo: (index:number) => void
}
const Index = () => {
    const main = useRef<RefInterface | null>(null);
    const list = useRef<RefInterface | null>(null);
    useEffect(() => {
        if (main.current) {
            main.current.refresh();
        }
    }, [])

    return NavigatorController.Instance().createNavigatorController([
        <div className="main-view" key="main-view"><Main ref={main} /></div>,
        <div className="list-view" key="list-view"><List ref={list} onClick={(city) => {
            if (main.current) {
                main.current.refresh();
                main.current.slideTo(city.index);
            }
        }} delHandle={(city) => {
            if (main.current) {
                main.current.refresh();
            }
        }} /></div>,
        <div className="search-view" key="search-view"><Search onClick={(city) => {
            if (list.current) {
                list.current.refresh();
            }
            if (main.current) {
                main.current.refresh();
            }
        }} /></div>
    ])
}

export default Index;