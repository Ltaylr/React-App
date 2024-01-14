import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
import generateMandelbrot from '../scripts/MandelbrotScript'

import {setInitialData, getClickCoordinate, getTopLeftCoordinate, coordinatePair, workerBufferPair} from '../helperFiles/MandelbrotHelpers'
interface mandelProp
{
    width:number,
    height:number,
    iterations:number,
    sampleNo:number, 
    workers:number
}
interface workerProp
{
    topLeftCoor: coordinatePair,
    width:number,
    height:number,
    iterations:number,
    sampleNo:number, 
    resolution:number
}
function spawnMandelbrotWorkers(props:workerProp, workerNum: number, context:React.MutableRefObject<CanvasRenderingContext2D>, workerArray:Array<workerBufferPair>)
{
    var workersRunning = 0;
    //var workerArray:Array<Worker> = []
    var start = performance.now();
    for(var i = 0; i < workerNum; i++)
    {
        var wProp = JSON.parse(JSON.stringify(props));
        //var worker = new Worker("../src/scripts/MandelbrotWorker.js", {type: 'module'});
        //var buffer = new Uint8ClampedArray((props.width * props.height * 4) / workerNum);
        workerArray[i].worker.addEventListener('message', function(e) {
            //setData(context,new Uint8ClampedArray(e.data.imageData), workerArray[e.data.id].width, props.height,workerArray[e.data.id].xcoor,0);
            //workerArray[e.data.id].terminate();
            var idata = context.current.createImageData(workerArray[e.data.id].width, props.height);
            idata.data.set(e.data.imageData);
            context.current.putImageData(idata, workerArray[e.data.id].xcoor, 0);
            workersRunning--;
            if(workersRunning === 0)
            {
                console.log(`time for ${workerNum} webworkers to finish: ${performance.now() - start}`);
            }
            }, false);
            workerArray[i].worker.onerror = (e) => { 
            console.log(e.message)
        }
        //workerArray.push(worker)
        wProp.width = workerArray[i].width;
        wProp.topLeftCoor.x += (workerArray[i].xcoor*props.resolution);
        workerArray[i].worker.postMessage({props:wProp, id:i, totalWorkers: workerNum})
        workersRunning++;
    }
    
    

}
function setData(contextRef:React.MutableRefObject<CanvasRenderingContext2D>, data:Uint8ClampedArray, width:number, height:number, x:number, y:number)
{
    var idata = contextRef.current.createImageData(width, height);
        idata.data.set(data);
        contextRef.current.putImageData(idata, x, y);
}
function buildWorkerArray(workerNum:number, workerArray:Array<workerBufferPair>, width:number, height:number)
{
    const fixedWidth = Math.round((width/workerNum)) - (workerNum*3);

    if(workerNum == workerArray.length)
    {
        return workerArray;
    }

    if(workerArray.length == 0)
    {
        for(var i = 0; i < workerNum - 1; i++)
        {
            workerArray.push(
                {
                    worker: new Worker("../src/scripts/MandelbrotWorker.js"),
                    id: i,
                    xcoor: fixedWidth*i,
                    width: fixedWidth,
                    buffer: new Uint8ClampedArray((fixedWidth * height * 4)/workerNum)
                }
            )
        }
    }
    if(workerNum < workerArray.length)
    {
        for(var i = workerArray.length - 1; i >= workerNum; i--)
        {
            workerArray[i].worker.terminate();
        }
        workerArray = workerArray.slice(0, workerNum);
        for(var i = 0; i < workerArray.length; i++)
        {
            workerArray[i].buffer = new Uint8ClampedArray(Math.floor(((width/workerNum)*height*4)/workerNum));
        }
    }
    else{
        
        for(var i = 0; i < workerArray.length; i++)
        {
            workerArray[i].buffer = workerArray[i].buffer.slice(0,(fixedWidth * height * 4)/workerNum)
            workerArray[i].xcoor = fixedWidth*i
        }
        for(var i = workerArray.length; i < workerNum - 1; i++)
        {
            
            workerArray.push(
                {
                    worker: new Worker("../src/scripts/MandelbrotWorker.js"),
                    id: i,
                    xcoor: fixedWidth*i,
                    width: fixedWidth,
                    buffer: new Uint8ClampedArray((fixedWidth * height * 4)/workerNum)
                }
            )
        }

        
    }

    const leftovers = width - fixedWidth * (workerNum - 1);
    const pos = fixedWidth*(workerNum - 1);
    workerArray.push(
        {
            worker: new Worker("../src/scripts/MandelbrotWorker.js"),
            id: workerNum - 1,
            xcoor: pos,
            width: leftovers,
            buffer: new Uint8ClampedArray((leftovers * height * 4)/workerNum)
        }
    )
    return workerArray;
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