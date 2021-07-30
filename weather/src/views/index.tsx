import React from "react";
import Detail from './detail';
import './index.scss';

const Index = () => {
    return <div className="main-container">
        <div className="main-background">
            <img src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=989&q=80" alt="" />
        </div>
        <div className="main">
            <Detail />
        </div>
        <div className="bottom">
            <div>
                <div className="support">
                    <img alt="hefeng" src="https://www.qweather.com/favicon-32x32.png?v=2021010553" />
                </div>
                <div className="page">
                    bar
                </div>
                <div className="menu">
                    bar
                </div>
            </div>
        </div>
    </div>
}

export default Index;