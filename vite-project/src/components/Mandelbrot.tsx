import {useRef, useEffect, useState} from 'react';
import { spawnMandelbrotWorkers, buildWorkerArray, workerProp, workerBufferPair } from '../helperFiles/WorkerSpawningHelpers';
import { mandelProp } from '../helperFiles/MandelbrotHelpers'
import { blackAndWhite, fillPalette, pinkAndBlue } from '../helperFiles/ColorFuncs';
import { handleSubmitForm, resetCanvas, reDrawImage, mouseDownHandle,mouseMoveHandle,mouseUpHandle, resetImage, clickHandle} from './handlers/MandlebrotHandlers';

function Mandelbrot(props:mandelProp)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);

    const [TopLeftCoordinate, setTopLeftCoordinate] = useState({x: -3, y: 2});
    const [res, setRes] = useState(2/(props.height/2));
    const [its, setIterations] = useState(props.iterations);
    const [samples, setSamples] = useState(props.sampleNo);
    const [workerNum, setWorkerNum] = useState(24);
    const [workerArray, setWorkerArray] = useState<workerBufferPair[]>([]);

    const wNumRef = useRef(workerNum);
    const tLcoor = useRef(TopLeftCoordinate);
    const resRef = useRef(res);
    const itsRef = useRef(its);
    const sampRef = useRef(samples);

    wNumRef.current = workerNum;
    tLcoor.current = TopLeftCoordinate;
    resRef.current = res;
    itsRef.current = its;
    sampRef.current = samples;

    const theme = useRef(pinkAndBlue);
    
    const getWorkerProp = (zoom=1) => {
        const wProp:workerProp = {
            topLeftCoor: tLcoor.current,
            width:canvasRef.current?.width!,
            height:canvasRef.current?.height!,
            iterations:itsRef.current, 
            sampleNo:sampRef.current,
            resolution:resRef.current*zoom
        }
        return wProp;
    }
    const reDraw = () =>
    {
        reDrawImage(canvasRef,setWorkerArray,getWorkerProp(),wNumRef.current,contextRef,workerArray,theme.current)
    }
    var doit:number;
    const handleResize = () =>
    {
        clearTimeout(doit);
        doit = setTimeout(reDraw, 100);
    }
    
    useEffect(() => {
        resetCanvas(canvasRef);
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!;
        contextRef.current = canvasRef.current!.getContext("2d")!;
        var arr = buildWorkerArray(workerNum, workerArray, width, height);
        setWorkerArray(a=>arr);
        const wProp:workerProp = {
            topLeftCoor:tLcoor.current,
            width:width,
            height:height,
            iterations:itsRef.current, 
            sampleNo:sampRef.current,
            resolution:resRef.current
        }
        spawnMandelbrotWorkers(wProp, contextRef, arr, theme.current);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    },[]);

    return <>
            
            <div className="mand-container">
                <div className="mand-item" id="mand-canvas">
                <canvas 
                    ref={canvasRef} 
                    onClick={(e) =>{clickHandle(e,resRef.current, TopLeftCoordinate,setTopLeftCoordinate,setRes,setWorkerArray,canvasRef,contextRef,workerNum,workerArray,getWorkerProp(.80),theme.current,.80)}}
                    onContextMenu={(e) =>{clickHandle(e,resRef.current, TopLeftCoordinate,setTopLeftCoordinate,setRes,setWorkerArray,canvasRef,contextRef,workerNum,workerArray,getWorkerProp(1.30),theme.current,1.30)}}
                    onMouseDown={mouseDownHandle}
                    onMouseMove={mouseMoveHandle}
                    onMouseUp={mouseUpHandle}
                />
                </div>
                <div className="mand-item" id='mand-submit'>
                    <h4 id='coor'>
                    Pixel Resolution:<br></br> {res.toString()} <br></br> Top Left Corner: <br></br>({TopLeftCoordinate.x}, {TopLeftCoordinate.y})
                    </h4>
                    <form onSubmit={(e) => {resetImage(e,setIterations,setTopLeftCoordinate,setRes,setWorkerArray,canvasRef,contextRef,workerArray,theme.current)}}>
                        <button type='submit'>Reset</button>
                    </form>
                    <form onSubmit={(e) => {handleSubmitForm(e,workerNum, workerArray, setWorkerArray, getWorkerProp(), contextRef, theme, canvasRef.current?.width!,canvasRef.current?.height!)}}>
                            <div>
                                Iterations: {its}
                                <div>
                                    <input type="range" min={50} max={5000} step={50} value={its} onChange={(e) => setIterations(its => Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Samples: {samples}
                                <div>
                                    <input type="range" min={1} max={12} value={samples} onChange={(e) => setSamples(samples => Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Threads: {workerNum}
                                <div>
                                    <input type="range" value={workerNum} min={1} max={100} onChange={(e) => setWorkerNum(workerNum => Number(e.target.value))}/>
                                </div>
                            </div>
                            <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </>
}

export default Mandelbrot;