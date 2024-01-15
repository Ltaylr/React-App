import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
import generateMandelbrot from '../scripts/MandelbrotScript'
import { spawnMandelbrotWorkers, buildWorkerArray, workerProp, workerBufferPair } from '../helperFiles/WorkerSpawningHelpers';
import {setInitialData, getClickCoordinate, getTopLeftCoordinate} from '../helperFiles/MandelbrotHelpers'
interface mandelProp
{
    width:number,
    height:number,
    iterations:number,
    sampleNo:number, 
    workers:number
}

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
    const [workerNum, setWorkerNum] = useState(2);
    const [workerArray, setWorkerArray] = useState<workerBufferPair[]>([]);
    //const [sharedBuffer] = useRef<SharedArrayBuffer>(new SharedArrayBuffer(props.width*props.height*4)); 

    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()
        if(workerNum === 1)
        {
            var start = performance.now();
            const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res, its, samples);
            setData(contextRef, buf, props.width, props.height, 0,0);
            console.log(`time for just main thread to finish render: ${performance.now() - start}`)
        }
        else{
            if(workerNum != workerArray.length)
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

            spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray);
        }
        

    }
    useEffect(() => {
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res,  props.iterations, samples);
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
                TopLeftCoordinate), TopLeftCoordinate);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*.80);
        
        
        if(workerNum === 1)
        {
            var start = performance.now();
            const buf = generateMandelbrot(newC, props.width, props.height, res*.80, its, samples);
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
                resolution:res*.80
            }
            spawnMandelbrotWorkers(wProp,workerNum, contextRef, workerArray);
        }
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
                        <div>
                            Number of WebWorkers: 
                            <input type="text" value={workerNum} onChange={(e) => setWorkerNum(workerNum => Number(e.target.value))}/>
                            <button type="submit">submit</button>
                        </div>
                </form>
            </div>
        </>
}

export default Mandelbrot;