import { MouseEvent, FormEvent, MutableRefObject } from 'react';
import { spawnMandelbrotWorkers, buildWorkerArray, workerProp, workerBufferPair } from '../../helperFiles/WorkerSpawningHelpers';
import {getClickCoordinate, getTopLeftCoordinate, mandelProp, coordinatePair} from '../../helperFiles/MandelbrotHelpers'
import { theme } from '../../helperFiles/ColorFuncs';

export function handleSubmitForm(e:FormEvent,
     workerNum:number, 
     workerArray:Array<workerBufferPair>, 
     setWorkerArray: Function, 
     wProp:workerProp, 
     contextRef:MutableRefObject<CanvasRenderingContext2D>, 
     theme:MutableRefObject<theme>,
     canvasWidth:number,
     canvasHeight:number  ){
    e.preventDefault();

    if(workerNum !== workerArray.length)
    {
        var newArr = buildWorkerArray(workerNum,workerArray,canvasWidth, canvasHeight,contextRef);
        setWorkerArray(newArr);
    }
    spawnMandelbrotWorkers(wProp,contextRef, workerArray, theme.current);
}
export function resetCanvas(canvasRef:React.RefObject<HTMLCanvasElement>)
{
    const canvas = canvasRef.current!;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
export function reDrawImage(canvasRef:React.RefObject<HTMLCanvasElement>, 
    setWorkerArray:Function, 
    workerProp:workerProp, 
    currentWorkerNum:number,
    contextRef:MutableRefObject<CanvasRenderingContext2D>,
    workerArray:Array<workerBufferPair>,
    theme:theme)
{
    resetCanvas(canvasRef)
    const width = canvasRef.current?.width!;
    const height = canvasRef.current?.height!;
    var arr = buildWorkerArray(currentWorkerNum, workerArray, width, height,contextRef);
    workerProp.height = height;
    setWorkerArray(arr);
    spawnMandelbrotWorkers(workerProp, contextRef, arr, theme);
}
export function resetImage(e:FormEvent,
    setIterations:Function,
    setTopLeftCoordinate:Function,
    setRes:Function,
    setWorkerArray:Function,
    canvasRef:React.RefObject<HTMLCanvasElement>,
    contextRef:MutableRefObject<CanvasRenderingContext2D>,
    workerArray:Array<workerBufferPair>,
    theme:theme)
    {
        e.preventDefault()
        const width = canvasRef.current?.width!;
        const height = canvasRef.current?.height!
        setIterations(180);
        setTopLeftCoordinate(({x:-3,y:2}));
        setRes(2/(height/2))
        
        const wProp:workerProp = {
            topLeftCoor:{x:-3,y:2},
            width:width,
            height:height,
            iterations:180, 
            sampleNo:1,
            resolution:(2/(height/2))
        }
        var arr = buildWorkerArray(workerArray.length, workerArray, width, height,contextRef);
        setWorkerArray(arr);
        spawnMandelbrotWorkers(wProp,contextRef, workerArray,theme);
}
export function clickHandle(event:MouseEvent, 
    res:number, 
    TopLeftCoordinate:coordinatePair,
    setTopLeftCoordinate:Function,
    setRes:Function,
    setWorkerArray:Function,
    canvasRef:React.RefObject<HTMLCanvasElement>,
    contextRef:MutableRefObject<CanvasRenderingContext2D>,
    workerNum:number,
    workerArray:Array<workerBufferPair>,
    wProp:workerProp,
    theme:theme,
    zoom:number
    )
{
    event.preventDefault();
    var newC = getTopLeftCoordinate(
        getClickCoordinate(
            event.nativeEvent.offsetX, 
            event.nativeEvent.offsetY,
            res,
            TopLeftCoordinate), TopLeftCoordinate, zoom);

    setTopLeftCoordinate(newC);
    setRes(res*zoom);
    
    if(workerNum !== workerArray.length)
    {
        
        var newArr = buildWorkerArray(workerNum,workerArray,canvasRef.current?.width!, canvasRef.current?.height!,contextRef);
        setWorkerArray(newArr);
    }
    wProp.topLeftCoor = newC;

    spawnMandelbrotWorkers(wProp,contextRef, workerArray,theme);

}

export function mouseDownHandle()
{

}
export function mouseMoveHandle()
{
    
}
export function mouseUpHandle()
{
    
}