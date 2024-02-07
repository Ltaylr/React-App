import { coordinatePair } from "./MandelbrotHelpers";
import {theme} from "./ColorFuncs"
import { MutableRefObject } from "react";
export interface workerBufferPair
{
    worker: Worker,
    id: number,
    xcoor: number,
    width: number,
    buffer: SharedArrayBuffer, 
    height: number,
    imageData: ImageData

}

export interface workerProp
{
    topLeftCoor: coordinatePair,
    width:number,
    height:number,
    iterations:number,
    sampleNo:number, 
    resolution:number
}

export function spawnMandelbrotWorkers(props:workerProp, context:React.MutableRefObject<CanvasRenderingContext2D>, workerArray:Array<workerBufferPair>, palette:theme)
{
    var workersRunning = 0;
    //var workerArray:Array<Worker> = []
    var start = performance.now();
    const workerNum = workerArray.length;
    for(var i = 0; i < workerNum; i++)
    {
        var wProp = JSON.parse(JSON.stringify(props));
 
        
        workerArray[i].worker.onerror = (e) => { 
        console.log(e.message)
        }
        
        wProp.width = workerArray[i].width;
        wProp.topLeftCoor.x += (workerArray[i].xcoor*props.resolution);
        workerArray[i].worker.postMessage({props:wProp, id:i, totalWorkers: workerNum, buffer:workerArray[i].buffer, theme:palette})
        workersRunning++;
    }
    
    

}

export function buildWorkerArray(workerNum:number, workerArray:Array<workerBufferPair>, width:number, height:number, contextRef:MutableRefObject<CanvasRenderingContext2D>)
{
    const fixedWidth = Math.floor(width/workerNum)
    const leftovers = width - fixedWidth*workerNum

    if(workerArray.length == 0)
    {
        for(var i = 0; i < workerNum; i++)
        {
            workerArray.push(
                {
                    worker: new Worker("../src/scripts/MandelbrotWorker.js", {type:'module'}),
                    id: i,
                    xcoor: fixedWidth*i,
                    width: fixedWidth,
                    buffer: new SharedArrayBuffer(fixedWidth * height * 4),
                    height: height,
                    imageData: contextRef.current.createImageData(fixedWidth, height)
                }
            )
            
        }
    }
    else if(workerNum < workerArray.length)
    {
        for(var i = workerArray.length - 1; i >= workerNum; i--)
        {
            workerArray[i].worker.terminate();
        }
        workerArray = workerArray.slice(0, workerNum);
        for(var i = 0; i < workerArray.length - 1; i++)
        {
            workerArray[i].buffer = new SharedArrayBuffer(fixedWidth * height * 4);
            workerArray[i].xcoor = fixedWidth*i;
            workerArray[i].width = fixedWidth;
            workerArray[i].height = height;
            workerArray[i].imageData = contextRef.current.createImageData(fixedWidth, height);
        }

        workerArray[workerArray.length - 1].id = workerNum - 1;
        workerArray[workerArray.length - 1].xcoor= width - (fixedWidth + leftovers);
        workerArray[workerArray.length - 1].width= fixedWidth + leftovers;
        workerArray[workerArray.length - 1].buffer= new SharedArrayBuffer((fixedWidth+leftovers) * height * 4);
        workerArray[workerArray.length - 1].height= height;
        workerArray[workerArray.length - 1].imageData = contextRef.current.createImageData((fixedWidth+leftovers), height);

        //return workerArray;
    }
    else if(workerNum > workerArray.length){
        
        for(var i = 0; i < workerArray.length; i++)
        {
            workerArray[i].buffer = workerArray[i].buffer.slice(0,(fixedWidth * height * 4))
            workerArray[i].xcoor = fixedWidth*i
            workerArray[i].width = fixedWidth
            workerArray[i].height = height
            workerArray[i].imageData = contextRef.current.createImageData(fixedWidth, height);
        }
        for(var i = workerArray.length; i < workerNum - 1; i++)
        {
            
            workerArray.push(
                {
                    worker: new Worker("../src/scripts/MandelbrotWorker.js",{type:'module'}),
                    id: i,
                    xcoor: fixedWidth*i,
                    width: fixedWidth,
                    buffer: new SharedArrayBuffer((fixedWidth * height * 4)),
                    height: height,
                    imageData: contextRef.current.createImageData(fixedWidth, height)
                }
            )
        }

        workerArray.push(
            {
                worker: new Worker("../src/scripts/MandelbrotWorker.js"),
                id: workerNum - 1,
                xcoor: width - (fixedWidth + leftovers),
                width: fixedWidth + leftovers,
                buffer: new SharedArrayBuffer((fixedWidth+leftovers) * height * 4),
                height: height,
                imageData: contextRef.current.createImageData((fixedWidth+leftovers), height)
            }
        )
        
    }
    else{
        for(var i = 0; i < workerNum - 1; i++)
        {
            
            workerArray[i].xcoor= fixedWidth*i;
            workerArray[i].width= fixedWidth;
            workerArray[i].buffer= new SharedArrayBuffer((fixedWidth) * height * 4);
            workerArray[i].height = height,
            workerArray[i].imageData = contextRef.current.createImageData(fixedWidth, height);
            
        }
        
        workerArray[workerArray.length - 1].xcoor= width - (fixedWidth + leftovers);
        workerArray[workerArray.length - 1].width= fixedWidth + leftovers;
        workerArray[workerArray.length - 1].buffer= new SharedArrayBuffer((fixedWidth+leftovers) * height * 4);
        workerArray[workerArray.length - 1].height = height;
        workerArray[workerArray.length - 1].imageData = contextRef.current.createImageData((fixedWidth+leftovers), height);
    }
    
    workerArray.forEach((elem) => {
        elem.worker.addEventListener('message', function(e) {
            
            //var idata = context.current.createImageData(workerArray[e.data.id].width, workerArray[e.data.id].height);
            var data = new Uint8ClampedArray(workerArray[e.data.id].buffer);
            workerArray[e.data.id].imageData.data.set(data);
            contextRef.current.putImageData(workerArray[e.data.id].imageData, workerArray[e.data.id].xcoor, 0);
            
            }, false);
    })
    return workerArray;
}