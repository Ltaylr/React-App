import Mandelbrot  from "../components/Mandelbrot.tsx";
import '../MandelbrotViewer.css'

export default function MandelbrotViewer()
{
    return(<div className="mandelbrot-viewer" id="mViewer">
        <Mandelbrot width={1800} height={1200} iterations={180} sampleNo={1} workers={2}/>
    </div>);
}


