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
    const [maxWorkers] = useState(24);
    const [samples, setSamples] = useState(props.sampleNo);
    const [workerNum, setWorkerNum] = useState(1);
    const [workerArray, setWorkerArray] = useState<workerBufferPair[]>([]);
    const [paletteBuffer, setPaletteBuffer] = useState<SharedArrayBuffer>(new SharedArrayBuffer(3*its));
    //const [sharedBuffer] = useRef<SharedArrayBuffer>(new SharedArrayBuffer(props.width*props.height*4)); 

    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()
        var pbuf = paletteBuffer;
        if(its*3 !== paletteBuffer.byteLength)
        {   
            pbuf = new SharedArrayBuffer(3*its);
            fillPalette(its, new Uint8ClampedArray(pbuf));
            setPaletteBuffer(pB=>pbuf);
            
        }
        if(workerNum === 1)
        {
            var start = performance.now();
            const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res, its, samples, pbuf);
            setData(contextRef, buf, props.width, props.height, 0,0);
            console.log(`time for just main thread to finish render: ${performance.now() - start}`)
        }
        else{
            if(workerNum !== workerArray.length)
            {
                var newArr = buildWorkerArray(workerNum,workerArray,props.width, props.height)
                setWorkerArray(arr=>newArr);
            }

            const wProp:workerProp = {
                topLeftCoor:TopLeftCoordinate,
                width:props.width,
                height:props.height,
                iterations:its, 
                sampleNo:samples,
                resolution:res
            }

            spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray, paletteBuffer);
        }
        

    }
    useEffect(() => {
        fillPalette(its, new Uint8ClampedArray(paletteBuffer))
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res,  props.iterations, samples, paletteBuffer);
        setInitialData(canvasRef,contextRef,buf,0,0,props.width, props.height);
        var arr = buildWorkerArray(workerNum, workerArray, props.width, props.height);
        setWorkerArray(a=>arr);

    },[]);
    
    const clickHandle = (event:MouseEvent) => {
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate, .80);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*.80);
        const newIts = Math.floor(its*1.05);
        setIterations(i=>newIts)
        var pbuf = paletteBuffer;
        if(newIts*3 !== paletteBuffer.byteLength)
        {   
            pbuf = new SharedArrayBuffer(3*newIts);
            fillPalette(newIts, new Uint8ClampedArray(pbuf));
            setPaletteBuffer(pB=>pbuf);
            
        }
        if(workerNum === 1)
        {
            var start = performance.now();
            const buf = generateMandelbrot(newC, props.width, props.height, res*.80, newIts, samples, pbuf);
            setData(contextRef, buf, props.width, props.height, 0,0);
            console.log(`time for just main thread to finish render: ${performance.now() - start}`)
        }
        else{
            const wProp:workerProp = {
                topLeftCoor:newC,
                width:props.width,
                height:props.height,
                iterations:newIts, 
                sampleNo:samples,
                resolution:res*.80
            }
            spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray,pbuf);
        }
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
        
        
        if(workerNum === 1)
        {
            var start = performance.now();
            const buf = generateMandelbrot(newC, props.width, props.height, res*1.30, its, samples, paletteBuffer);
            setData(contextRef, buf, props.width, props.height, 0,0);
            console.log(`time for just main thread to finish render: ${performance.now() - start}`)
        }
        else{
            const wProp:workerProp = {
                topLeftCoor:newC,
                width:props.width,
                height:props.height,
                iterations:its, 
                sampleNo:samples,
                resolution:res*1.15
            }
            spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray, paletteBuffer);
        }
    };

    return <>
            
            <div className="mand-container">
                <div className="mand-item">
                <canvas 
                    ref={canvasRef} 
                    width={props.width} 
                    height={props.height}
                    onClick={clickHandle}
                    onContextMenu={rightClickHandle}
                />
                </div>
                <div className="mand-item" id='mand-submit'>
                    <h4>
                    Pixel Resolution: {res.toString()} <br></br> Top Left Corner: ({TopLeftCoordinate.x},{TopLeftCoordinate.y})
                    </h4>
                    <form onSubmit={handleSubmit}>

                            <div>
                                Iterations: 
                                <input type="text" value={its} onChange={(e) => setIterations(its => Number(e.target.value))}/>

                            </div>
                            <div>
                                Samples: 
                                <input type="text" value={samples} onChange={(e) => setSamples(samples => Number(e.target.value))}/>

                            </div>
                            <div>
                                Threads: 
                                <input type="text" value={workerNum} onChange={(e) => setWorkerNum(workerNum => Number(e.target.value))}/>
                            </div>
                            <button type="submit">submit</button>
                    </form>
                </div>
            </div>
        </>
}

export default Mandelbrot;