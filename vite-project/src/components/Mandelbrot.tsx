import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
import generateMandelbrot from '../scripts/MandelbrotScript'
import { spawnMandelbrotWorkers, buildWorkerArray, workerProp, workerBufferPair } from '../helperFiles/WorkerSpawningHelpers';
import {setInitialData, getClickCoordinate, getTopLeftCoordinate, mandelProp} from '../helperFiles/MandelbrotHelpers'
import { fillPalette } from '../helperFiles/ColorFuncs';


function setData(contextRef:React.MutableRefObject<CanvasRenderingContext2D>, data:Uint8ClampedArray, width:number, height:number, x:number, y:number)
{
    var idata = contextRef.current.createImageData(width, height);
        idata.data.set(data);
        contextRef.current.putImageData(idata, x, y);
}

function Mandelbrot(props:mandelProp)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);
    const [TopLeftCoordinate, setTopLeftCoordinate] = useState({x: -3, y: 2});
    const [res, setRes] = useState(2/(props.height/2));
    const [its, setIterations] = useState(props.iterations);
    const [samples, setSamples] = useState(props.sampleNo);
    const [workerNum, setWorkerNum] = useState(1);
    const [workerArray, setWorkerArray] = useState<workerBufferPair[]>([]);
    const [paletteBuffer, setPaletteBuffer] = useState<SharedArrayBuffer>(new SharedArrayBuffer(3*its));
    const wNumRef = useRef(workerNum);
    const tLcoor = useRef(TopLeftCoordinate);
    const resRef = useRef(res);
    const itsRef = useRef(its);
    const sampRef = useRef(samples);
    const paletteRef = useRef(paletteBuffer);
    wNumRef.current = workerNum;
    tLcoor.current = TopLeftCoordinate;
    resRef.current = res;
    itsRef.current = its;
    sampRef.current = samples;
    paletteRef.current = paletteBuffer;


    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()
        var pbuf = paletteBuffer;
        if(its*3 !== paletteBuffer.byteLength)
        {   
            pbuf = new SharedArrayBuffer(3*its);
            fillPalette(its, new Uint8ClampedArray(pbuf));
            setPaletteBuffer(pB=>pbuf);
            
        }

        if(workerNum !== workerArray.length)
        {
            
            var newArr = buildWorkerArray(workerNum,workerArray,canvasRef.current?.width!, canvasRef.current?.height!);
            setWorkerArray(arr=>newArr);
        }
        const wProp:workerProp = {
            topLeftCoor:TopLeftCoordinate,
            width:canvasRef.current?.width!,
            height:canvasRef.current?.height!,
            iterations:its, 
            sampleNo:samples,
            resolution:res
        }
        spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray, paletteBuffer);
        
        

    }
    var doit:number;
    const handleResize = () =>
    {
        clearTimeout(doit);
        doit = setTimeout(reDrawImage, 100);

    }
    const reDrawImage = () =>
    {
        const canvas = canvasRef.current!;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!
        var arr = buildWorkerArray(wNumRef.current, workerArray, width, height);
        setWorkerArray(a=>arr);
        const wProp:workerProp = {
            topLeftCoor:tLcoor.current,
            width:width,
            height:height,
            iterations:itsRef.current, 
            sampleNo:sampRef.current,
            resolution:resRef.current
        }
        spawnMandelbrotWorkers(wProp,wNumRef.current, contextRef, arr, paletteRef.current);
    }
    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!
        fillPalette(its, new Uint8ClampedArray(paletteBuffer))
        const buf = generateMandelbrot(TopLeftCoordinate, width, height, res,  props.iterations, samples, paletteBuffer);
        setInitialData(canvasRef,contextRef,buf,0,0,width, height);
        var arr = buildWorkerArray(workerNum, workerArray, width, height);
        setWorkerArray(a=>arr);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    },[]);
    
    const clickHandle = (event:MouseEvent) => {
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate, .80);

        setTopLeftCoordinate(c=>newC);
        setRes(a => a*.80);
        const newIts = Math.floor(its*1.05);
        setIterations(i=>newIts)
        var pbuf = paletteBuffer;
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!;
        
        if(workerNum !== workerArray.length)
        {
            
            var newArr = buildWorkerArray(workerNum,workerArray,canvasRef.current?.width!, canvasRef.current?.height!);
            setWorkerArray(arr=>newArr);
        }

        if(newIts*3 !== paletteBuffer.byteLength)
        {   
            pbuf = new SharedArrayBuffer(3*newIts);
            fillPalette(newIts, new Uint8ClampedArray(pbuf));
            setPaletteBuffer(pB=>pbuf);
            
        }

        const wProp:workerProp = {
            topLeftCoor:newC,
            width:width,
            height:height,
            iterations:newIts, 
            sampleNo:samples,
            resolution:res*.80
        }
        spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray,pbuf);

    };

    const rightClickHandle = (event:MouseEvent) => {
        
        event.preventDefault();
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate, 1.30);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*1.30);
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!;
        
        if(workerNum !== workerArray.length)
        {
            
            var newArr = buildWorkerArray(workerNum,workerArray,canvasRef.current?.width!, canvasRef.current?.height!);
            setWorkerArray(arr=>newArr);
        }
        
        const wProp:workerProp = {
            topLeftCoor:newC,
            width:width,
            height:height,
            iterations:its, 
            sampleNo:samples,
            resolution:res*1.30
        }
        spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray, paletteBuffer);
        
    };

    return <>
            
            <div className="mand-container">
                <div className="mand-item" id="mand-canvas">
                <canvas 
                    ref={canvasRef} 
                    onClick={clickHandle}
                    onContextMenu={rightClickHandle}
                />
                </div>
                <div className="mand-item" id='mand-submit'>
                    <h4 id='coor'>
                    Pixel Resolution:<br></br> {res.toString()} <br></br> Top Left Corner: <br></br>({TopLeftCoordinate.x}, {TopLeftCoordinate.y})
                    </h4>
                    <form onSubmit={handleSubmit}>

                            <div>
                                Iterations: {its}
                                <div>
                                    <input type="range" min={50} max={12000} step={100} value={its} onChange={(e) => setIterations(its => Number(e.target.value))}/>
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
                            <button type="submit">submit</button>
                    </form>
                </div>
            </div>
        </>
}

export default Mandelbrot;