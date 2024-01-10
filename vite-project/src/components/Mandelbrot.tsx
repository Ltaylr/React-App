import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
import generateMandelbrot from '../scripts/MandelbrotScript'
import {setInitialData, setData, getClickCoordinate, getTopLeftCoordinate} from '../helperFiles/MandelbrotHelpers'
interface mandelProp
{
    width:number,
    height:number,
    iterations:number,
    sampleNo:number
}

function Mandelbrot(props:mandelProp)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);
    const [TopLeftCoordinate, setTopLeftCoordinate] = useState({x: -3, y: 2});
    const [res, setRes] = useState(2/(props.height/2));
    const [its, setIterations] = useState(props.iterations)
    const [samples, setSamples] = useState(props.sampleNo)
    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res, its, samples);
        setData(contextRef, buf, props.width, props.height, 0,0);

    }
    useEffect(() => {
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res,  props.iterations, samples);
        setInitialData(canvasRef,contextRef,buf,0,0,props.width, props.height);

    },[]);
    
    const clickHandle = (event:MouseEvent) => {
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*.80);
        const buf = generateMandelbrot(newC, props.width, props.height, res*.80, its, samples);
        setData(contextRef, buf, props.width, props.height, 0,0);
    };

    const rightClickHandle = (event:MouseEvent) => {
        
        var c = {x: (event.nativeEvent.offsetX - props.width/2)*res, y: (event.nativeEvent.offsetY - props.height/2)*res};
        setRes(a => a*1.0525631);
        const buf = generateMandelbrot(c, props.width, props.height, res*1.0525631, its, samples);
        setData(contextRef, buf, props.width, props.height, 0,0);
    };

    return <>
            <h4>
                Pixel Resolution: {res.toString()} , Top Left Corner: ({TopLeftCoordinate.x},{TopLeftCoordinate.y})
            </h4>
            <div>
                <canvas 
                    ref={canvasRef} 
                    width={props.width} 
                    height={props.height}
                    onClick={clickHandle}
                    onContextMenu={rightClickHandle}
                />
                <form onSubmit={handleSubmit}>
                        <div>
                            Iterations per pixel: 
                            <input type="text" value={its} onChange={(e) => setIterations(its => Number(e.target.value))}/>
                            <button type="submit">submit</button>
                        </div>
                        <div>
                            Samples per pixel: 
                            <input type="text" value={samples} onChange={(e) => setSamples(samples => Number(e.target.value))}/>
                            <button type="submit">submit</button>
                        </div>
                </form>
            </div>
        </>
}

export default Mandelbrot;