import Mandelbrot  from "../components/Mandelbrot.tsx";

export default function MandelbrotViewer()
{
    return(<div className="mandelbrot-viewer">
        <Mandelbrot width={1400} height={1000} iterations={300} sampleNo={2} workers={2}/>
    </div>);
}


