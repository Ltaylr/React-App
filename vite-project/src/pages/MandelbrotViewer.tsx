import Mandelbrot  from "../components/MandelbrotGL.tsx";
export default function MandelbrotViewer()
{
    
    return(<div className="mandelbrot-viewer">
        <Mandelbrot width={1200} height={800} iterations={200}/>
    </div>);
}


