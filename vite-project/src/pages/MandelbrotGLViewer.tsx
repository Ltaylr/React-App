import MandelbrotGL  from "../components/MandelbrotGL.jsx";

export default function MandelbrotGLViewer()
{
    return(<div className="mandelbrot-viewer">
        <MandelbrotGL width={1200} height={800} iterations={500} sampleNo={1}/>
    </div>);
}