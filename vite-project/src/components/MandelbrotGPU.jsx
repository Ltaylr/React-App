import {GPU, Kernel, IKernelRunShortcut, KernelOutput, KernelFunction, KernelValue} from 'gpu.js'
import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';



function getIterations(x, y, maxIts)
{
    var its = 0;
    var zx = 0;
    var zy = 0;
    var xtemp = 0;
    var zx2 = 0;
    var zy2 = 0;
    while(its < maxIts && (zx2 + zy2 < 4))
    {
        xtemp = zx2 - zy2 + x;
        zy = 2*zx*zy + y;
        zx = xtemp;
        zx2 = zx*zx;
        zy2 = zy*zy;
        its++;
    }

    return its;
}
function getColor(its, maxIts)
{
    //just grayscale for now
    if(its==maxIts) return [0,0,0];
    
    var div = Math.log(its)/Math.log(maxIts);
    //var div2 = Math.abs(div - .5)
    var color = [255*div,80*div, 200*div];
    //if(its > maxIts*.5)
    //{
    //    color = [255*div,80*div, 200*div]
    //}
    return color;
}
//const mandKernel: KernelFunction = 
function calculateMandelbrot(topLeftCoor, maxIts, samples, width, height, res, gpu, canvas)
{
    gpu.addFunction(getIterations);
    gpu.addFunction(getColor);

    let kernel = gpu.createKernel(
        function(tlx, tly, maxIts, samples, res)
        {
            var its = 0;
            //for(var i = 0; i < samples; i++)
            //{
                var inc = (res*0)/samples;
               its += getIterations(tlx+(this.thread.x*res)+inc, tly - (this.thread.y*res)+inc, maxIts);
            //}
            
            if(its > 50)
            {
                its+=1;
            }
            return its;//getColor(its/samples, maxIts);
            
        }//,{output:[width,height]}//, graphical: true, canvas: canvas}
    ).setOutput([width, height])
    //.setGraphical(true);
    

    let c =Float32Array.from(kernel(topLeftCoor.x, topLeftCoor.y, maxIts, samples, res));
    var buffer = new Uint8ClampedArray(4 * width*height);

    for(var i = 0; i < height; i++)
    {
        var offset_i = i*width*4; 
        for(var j = 0; j < width; j++)
        {
            var clr =getColor(c[i+j], maxIts);
            buffer[(offset_i)+(j*4)] = clr[0];
            buffer[(offset_i)+(j*4)+1] = clr[1];
            buffer[(offset_i)+(j*4)+2] = clr[2];
            buffer[(offset_i)+(j*4)+3] = 255;
        }
    }
    return ;
}

function getTopLeftCoordinate(clickCoor, currentCornerCoor, res)
{
    //const hypotenusePixelLength: number = Math.sqrt(clickPoint.x*clickPoint.x + clickPoint.y*clickPoint.y);
    //const hypotenuseCoorLength: number = Math.sqrt(Math.pow(clickCoor.x - currentCornerCoor.x, 2) + Math.pow(clickCoor.y - currentCornerCoor.y, 2));
    var y_dif = currentCornerCoor.y - clickCoor.y;
    var x_dif = clickCoor.x - currentCornerCoor.x;
    y_dif*=.80;
    x_dif*=.80;
    var ret = {x:clickCoor.x - x_dif, y:clickCoor.y+y_dif}
    return ret;


}
function getClickCoordinate(x, y, res, corner)
{
    return {x: corner.x + (x*res), y: corner.y - (y*res)};
}

function MandelbrotGPU(props)
{
    const gpuRef = useRef<GPU>(new GPU());
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<WebGL2RenderingContext>(null);
    const [TopLeftCoordinate, setTopLeftCoordinate] = useState({x: -3, y: 2});
    const [res, setRes] = useState(2/(props.height/2));
    const [its, setIterations] = useState(200);
    const [samples, setSamples] = useState(props.samples)

    const handleSubmit = (e) => {
        e.preventDefault()
        const gpu = gpuRef.current
        //const buf:HTMLCanvasElement = 
        calculateMandelbrot(TopLeftCoordinate, props.iterations, props.samples, props.width, props.height, res, gpu, canvasRef.current);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set();
        //contextRef.current.putImageData(buf.getContext("2d")!.getImageData(0,0,props.width, props.height), 0, 0);
        //contextRef.current = buf.getContext("webgl2");

    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('WebGL2RenderingContext');
        const gpu = gpuRef.current;
        const buf = calculateMandelbrot(TopLeftCoordinate, props.iterations, props.samples, props.width, props.height, res, gpu, canvasRef.current);
       // var idata = context!.createImageData(props.width, props.height);
        //var arr = new Uint8ClampedArray(4 * props.width*props.height)
        //buf.getContext("webgl2", {preserveDrawingBuffer:}).readPixels(0,0,props.width, props.height, 1,1, arr);
        //idata.data.set(buf);
        //buf.getContext("webgl2")!.getImageData(0,0,props.width, props.height)
        //context!.putImageData(idata, 0, 0);
        //contextRef.current = buf.getContext("webgl2");
        //context.drawImage()
        canvasRef.current = buf;

    },[]);

    const clickHandle = (event) => {
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate, res);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*.80);
        const gpu = gpuRef.current;
        const buf = calculateMandelbrot(TopLeftCoordinate, props.iterations, props.samples, props.width, props.height, res, gpu);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0);
    };

    const rightClickHandle = (event) => {
        
        var c = {x: (event.nativeEvent.offsetX - props.width/2)*res, y: (event.nativeEvent.offsetY - props.height/2)*res};
        setRes(a => a*1.18);
        const gpu = gpuRef.current; 
        const buf = calculateMandelbrot(TopLeftCoordinate, props.iterations, props.samples, props.width, props.height, res, gpu);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0); 
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
        </form>
    </div>
</>
}

export default MandelbrotGPU;
