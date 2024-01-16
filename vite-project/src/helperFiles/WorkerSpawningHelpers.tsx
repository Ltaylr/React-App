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

export function spawnMandelbrotWorkers(props:workerProp, workerNum: number, context:React.MutableRefObject<CanvasRenderingContext2D>, workerArray:Array<workerBufferPair>)
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
        //workerArray.push(worker)
        wProp.width = workerArray[i].width;
        wProp.topLeftCoor.x += (workerArray[i].xcoor*props.resolution);
        workerArray[i].worker.postMessage({props:wProp, id:i, totalWorkers: workerNum, buffer:workerArray[i].buffer})
        workersRunning++;
    }
    
    

}

export function buildWorkerArray(workerNum:number, workerArray:Array<workerBufferPair>, width:number, height:number)
{
    const fixedWidth = Math.round((width/workerNum)) - (workerNum*3);
    const leftovers = width - fixedWidth * (workerNum - 1);
    const pos = fixedWidth*(workerNum - 1);

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
        workerArray[workerArray.length - 1].xcoor= pos;
        workerArray[workerArray.length - 1].width= leftovers;
        workerArray[workerArray.length - 1].buffer= new SharedArrayBuffer((leftovers * height * 4));

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
                xcoor: pos,
                width: leftovers,
                buffer: new SharedArrayBuffer((leftovers * height * 4))
            }
        )
        
    }

    
    return workerArray;
}