import React, { useEffect, useState } from "react";
import Main from './main';

const Index = () => {
    
    const goto = (page:string) => {

    }

    return <div className="container">
        <Main className="main-view" goto={goto}/>
    </div>
}

export default Index;