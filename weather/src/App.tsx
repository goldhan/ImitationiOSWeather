import React, {useEffect} from "react";
import FastClick from 'fastclick';
import Index from './views';
import './App.scss';

function App() {
  useEffect(() => {
    FastClick(document.body);
  }, [])
  return (
    <div className="App">
      <Index />
    </div>
  );
}

export default App;
