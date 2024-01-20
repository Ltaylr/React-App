import { coordinatePair } from "./MandelbrotHelpers";

export interface workerBufferPair
{
    worker: Worker,
    id: number,
    xcoor: number,
    width: number,
    buffer: SharedArrayBuffer

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

export function spawnMandelbrotWorkers(props:workerProp, workerNum: number, context:React.MutableRefObject<CanvasRenderingContext2D>, workerArray:Array<workerBufferPair>, palette:SharedArrayBuffer)
{
    var workersRunning = 0;
    //var workerArray:Array<Worker> = []
    var start = performance.now();
    for(var i = 0; i < workerNum; i++)
    {
        var wProp = JSON.parse(JSON.stringify(props));
 
        workerArray[i].worker.addEventListener('message', function(e) {
            
            var idata = context.current.createImageData(workerArray[e.data.id].width, props.height);
            var data = new Uint8ClampedArray(workerArray[e.data.id].buffer);
            idata.data.set(data);
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
        
        wProp.width = workerArray[i].width;
        wProp.topLeftCoor.x += (workerArray[i].xcoor*props.resolution);
        workerArray[i].worker.postMessage({props:wProp, id:i, totalWorkers: workerNum, buffer:workerArray[i].buffer, palette:palette})
        workersRunning++;
    }
    
    

}

export function buildWorkerArray(workerNum:number, workerArray:Array<workerBufferPair>, width:number, height:number)
{
    const fixedWidth = Math.floor(width/workerNum)
    const leftovers = width - fixedWidth*workerNum
    //const pos = fixedWidth*(workerNum - 1);

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
                    buffer: new SharedArrayBuffer(fixedWidth * height * 4)
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
            workerArray[i].buffer = new SharedArrayBuffer(fixedWidth * height * 4)
            workerArray[i].xcoor = fixedWidth*i,
            workerArray[i].width = fixedWidth
        }

        workerArray[workerArray.length - 1].id = workerNum - 1;
        workerArray[workerArray.length - 1].xcoor= width - (fixedWidth + leftovers);
        workerArray[workerArray.length - 1].width= fixedWidth + leftovers;
        workerArray[workerArray.length - 1].buffer= new SharedArrayBuffer((fixedWidth+leftovers) * height * 4);

        //return workerArray;
    }
    else if(workerNum > workerArray.length){
        
        for(var i = 0; i < workerArray.length; i++)
        {
            workerArray[i].buffer = workerArray[i].buffer.slice(0,(fixedWidth * height * 4))
            workerArray[i].xcoor = fixedWidth*i
            workerArray[i].width = fixedWidth
        }
        for(var i = workerArray.length; i < workerNum - 1; i++)
        {
            
            workerArray.push(
                {
                    worker: new Worker("../src/scripts/MandelbrotWorker.js",{type:'module'}),
                    id: i,
                    xcoor: fixedWidth*i,
                    width: fixedWidth,
                    buffer: new SharedArrayBuffer((fixedWidth * height * 4))
                }
            )
        }

        workerArray.push(
            {
                worker: new Worker("../src/scripts/MandelbrotWorker.js"),
                id: workerNum - 1,
                xcoor: width - (fixedWidth + leftovers),
                width: fixedWidth + leftovers,
                buffer: new SharedArrayBuffer((fixedWidth+leftovers) * height * 4)
            }
        )
        
    }
    
    return workerArray;
}