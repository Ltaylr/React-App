import MandelbrotGL  from "../components/MandelbrotGL.jsx";

export default function MandelbrotGLViewer()
{
    return(<div className="mandelbrot-viewer">
        <MandelbrotGL width={1600} height={1200} iterations={500} sampleNo={1}/>
    </div>);
}