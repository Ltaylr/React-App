import {useRef, useEffect, useState} from 'react';
import { spawnMandelbrotWorkers, buildWorkerArray, workerProp, workerBufferPair } from '../helperFiles/WorkerSpawningHelpers';
import { mandelProp } from '../helperFiles/MandelbrotHelpers'
import { themeArray, pinkAndBlue } from '../helperFiles/ColorFuncs';
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
    const [zoomIn, setZoomIn] = useState<number>(7);
    const [zoomOut, setZoomOut] = useState<number>(3);
    const [curTheme, setCurTheme] = useState<number>(1);
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
        doit = setTimeout(reDraw, 200);
    }
    const handleScroll = () =>
    {
        clearTimeout(doit);
        doit = setTimeout(spawnW, 200);
    }
    const spawnW = () => 
    {
        spawnMandelbrotWorkers(getWorkerProp(), workerArray, theme.current)
    }

    useEffect(() => {
        resetCanvas(canvasRef);
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!;
        contextRef.current = canvasRef.current!.getContext("2d")!;
        var arr = buildWorkerArray(workerNum, workerArray, width, height,contextRef);
        setWorkerArray(arr);
        const wProp:workerProp = {
            topLeftCoor:tLcoor.current,
            width:width,
            height:height,
            iterations:itsRef.current, 
            sampleNo:sampRef.current,
            resolution:resRef.current
        }
        spawnMandelbrotWorkers(wProp, arr, theme.current);
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
                    onClick={(e) =>{clickHandle(e,resRef.current, TopLeftCoordinate,setTopLeftCoordinate,setRes,setWorkerArray,canvasRef,contextRef,workerNum,workerArray,getWorkerProp(1.1 - zoomIn*.1),theme.current,1.1 - zoomIn*.1)}}
                    onContextMenu={(e) =>{clickHandle(e,resRef.current, TopLeftCoordinate,setTopLeftCoordinate,setRes,setWorkerArray,canvasRef,contextRef,workerNum,workerArray,getWorkerProp(1 + zoomOut*.1),theme.current,1 + zoomOut*.1)}}
                    onMouseDown={mouseDownHandle}
                    onMouseMove={mouseMoveHandle}
                    onMouseUp={mouseUpHandle}
                    onWheel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIterations(itsRef.current+Math.round(e.deltaY*-0.05));
                        handleScroll();
                        return false;
                    }}
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
                                    <input type="text"  value={its} onChange={(e) => setIterations(Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Samples: {samples}
                                <div>
                                    <input type="range" min={1} max={12} value={samples} onChange={(e) => setSamples(Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Threads: {workerNum}
                                <div>
                                    <input type="range" value={workerNum} min={1} max={100} onChange={(e) => setWorkerNum(Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Zoom In Level: {zoomIn}
                                <div>
                                    <input type="range" value={zoomIn} min={1} max={10} onChange={(e) => setZoomIn(Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Zoom Out Level: {zoomOut}
                                <div>
                                    <input type="range" value={zoomOut} min={1} max={10} onChange={(e) => setZoomOut(Number(e.target.value))}/>
                                </div>
                            </div>
                            <div>
                                Theme: {theme.current.name}
                                <div>
                                    <input type="range" value={curTheme + 1} min={1} max={themeArray.length} onChange={(e) => {setCurTheme(Number(e.target.value) - 1);theme.current = themeArray[Number(e.target.value) - 1]}}/>
                                </div>
                            </div>
                            <button type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </>
}

export default Mandelbrot;