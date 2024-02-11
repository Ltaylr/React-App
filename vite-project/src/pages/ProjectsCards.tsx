import {useRef, useEffect, useState} from 'react';
import { Routes, Route } from "react-router-dom"; 
import MandelbrotViewer from './MandelbrotViewer.tsx'
import MandelbrotGLViewer from './MandelbrotGLViewer.tsx'
import './Projects.css';

interface projectLinkObj
{
  id:number,
  name:string,
  path:string,
  comp:string,
  img:string,
  title:string,
  blurb:string
}

const projectCardData:Array<projectLinkObj> =[

  {
    id: 1,
    name: "Mandelbrot Viewer",
    path: "mandelbrotViewer",
    comp: "MandelbrotViewer",
    img: "/images/mandelbrot_img.jpg",
    title: "Mandelbrot Explorer",
    blurb: "A online mandelbrot set explorer implemented using WebWorkers and HTML Canvas element"
  },
  {
    id: 2,
    name: "Webgl Mandelbrot",
    path: "mandelbrotGLViewer",
    comp: "MandelbrotGLViewer",
    img: "/images/mandelbrot_img.jpg",
    title: "Mandelbrot WebGL Explorer",
    blurb: "A online mandelbrot set explorer implemented using WebGL and HTML Canvas element"
  
  },

];


function ProjectCards() {
    return ( <>
        <ul className="project-cards-container">
              {
                projectCardData.map((item, index) => (<li className="project-card" key={index}>
                  <a key={index} href={"/"+item.path}>
                    {item.name}
                    <img key={index} src={item.img}/>
                    </a>
                  </li>))
              }
      </ul>
              <Routes>
              <Route path="/mandelbrotviewer" element={<MandelbrotViewer />}/>
              <Route path="/mandelbrotglviewer" element={<MandelbrotGLViewer />}/>
          </Routes>
      </>
    )
  }
  export default ProjectCards

