import "./init.js"
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Home from "./pages/Home"; 
import Blogs from "./pages/Blogs"; 
import Contact from "./pages/Contact"; 
import NoPage from "./pages/NoPage";
import MandelbrotViewer from './pages/MandelbrotViewer.tsx'
import MandelbrotGLViewer from './pages/MandelbrotGLViewer.tsx'

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
      id: 2,
      name: "blogs",
      path: "blogs",
      comp: "Blogs",
    },
    {
      id: 3,
      name: "contact",
      path: "contact",
      comp: "Contact",
    },
    {
      id: 4,
      name: "about",
      path: "about",
      comp: "About",
    },
    {
      id: 5,
      name: "Mandelbrot Viewer",
      path: "mandelbrotViewer",
      comp: "MandelbrotViewer",
    },
    {
      id: 5,
      name: "Webgl Mandelbrot",
      path: "mandelbrotGLViewer",
      comp: "MandelbrotGLViewer",
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
          <Route path="/mandelbrotglviewer" element={<MandelbrotGLViewer />}/>
          <Route path="*" element={<NoPage />}/>
      </Routes>
    </BrowserRouter>
    <div className="side-nav">
      {
        pageData.map((item, index) => (<a key={index} href={item.path}>{item.name}</a>))
      }
    </div>
    </div>
  )
}
export default App
