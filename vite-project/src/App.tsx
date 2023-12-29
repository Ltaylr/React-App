import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Mandelbrot from './components/Mandelbrot.tsx'

import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Layout from "./pages/Layout"; 
import Home from "./pages/Home"; 
import Blogs from "./pages/Blogs"; 
import Contact from "./pages/Contact"; 
import NoPage from "./pages/NoPage";
import MandelbrotViewer from './pages/MandelbrotViewer.tsx'

interface linkObj
{
  id:number,
  name:string,
  path:string,
  comp:string
}
const pageData:Array<linkObj> =[
    {
      id: 1,
      name: "home",
      path: "home",
      comp: "Home",
    },
    {
      id: 1,
      name: "blogs",
      path: "blogs",
      comp: "Blogs",
    },
    {
      id: 1,
      name: "contact",
      path: "contact",
      comp: "Contact",
    },
    {
      id: 1,
      name: "about",
      path: "about",
      comp: "About",
    },
    {
      id: 1,
      name: "mandelbrotViewer",
      path: "mandelbrotViewer",
      comp: "MandelbrotViewer",
    },

];

function App() {
  

  return (
    <div className="App">
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/blogs" element={<Blogs />}/>
          <Route path="/contact" element={<Contact />}/>
          <Route path="/mandelbrotviewer" element={<MandelbrotViewer />}/>
          <Route path="*" element={<NoPage />}/>
      </Routes>
    </BrowserRouter>
    <div className="side-nav">
      {
        pageData.map((item, index) => (<a key={index} href={item.path}>{item.comp}</a>))
      }
    </div>
    </div>
  )
}
export default App

//<div>
//        <a href="https://vitejs.dev" target="_blank">
//          <img src={viteLogo} className="logo" alt="Vite logo" />
//        </a>
//        <a href="https://react.dev" target="_blank">
//          <img src={reactLogo} className="logo react" alt="React logo" />
//        </a>
//      </div>
//      <h1>Vite + React</h1>
//      <div className="card">
//        <Mandelbrot width={700} height={500}/>
//        <button onClick={() => setCount((count) => count + 1)}>
//          count is {count}
//        </button>
//        <p>
//          Edit <code>src/App.tsx</code> and save to test HMR
//        </p>
//      </div>
//      <p className="read-the-docs">
//        Click on the Vite and React logos to learn more
//      </p>
//