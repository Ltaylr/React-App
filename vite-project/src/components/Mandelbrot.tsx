import {useRef, useEffect, useState} from 'react';
import { MouseEvent } from 'react';
interface mandelProp
{
    width:number,
    height:number
}

interface coordinatePair
{
    x:number,
    y:number
}
function getIterations(coor:coordinatePair, maxIts:number)
{
    var its = 0;
    var x = coor.x;
    var y = coor.y;
    var zx = 0;
    var zy = 0;
    while(its < maxIts && (zx*zx + zy*zy < 4))
    {
        var xtemp = zx*zx - zy*zy + x;
        zy = 2*zx*zy + y;
        zx = xtemp;
        its++;
    }

    return its;
}
function getColor(its:number, maxIts:number)
{
    //just grayscale for now
    if(its==maxIts) return [0,0,0];
    
    const div:number = its/maxIts;
    return [0,255*div, 125*div];
}
function generateMandelbrot(center:coordinatePair, width:number, height:number, res:number, maxIts=1000)
{
    const topLeftCorner = {x: center.x - (width/2)*res, y: center.y + (height/2)*res};
    const buffer = new Uint8ClampedArray(width * height * 4);

    for(var i = 0; i < height; i++)
    {
        for(var j = 0; j < width; j++)
        {
            var clr =getColor(getIterations({x:topLeftCorner.x+(j*res),y:topLeftCorner.y-(i*res)}, maxIts),maxIts);
            buffer[(i*width*4)+(j*4)] = clr[0];
            buffer[(i*width*4)+(j*4)+1] = clr[1];
            buffer[(i*width*4)+(j*4)+2] = clr[2];
            buffer[(i*width*4)+(j*4)+3] = 255;//grayscale for now
        }
    }

    return buffer;
}
function getNewCenter(offsetX:number, offsetY:number, res:number, width:number, height:number, oldCenter:coordinatePair)
{
    var offset = {x:offsetX - width/2, y:offsetY - height/2}
    offset.x*=res;
    offset.y*=res;
    offset.x+=oldCenter.x;
    offset.y=oldCenter.y-offset.y;
    
    return offset;
     

}

function Mandelbrot(props:mandelProp)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);
    const [center, setCenter] = useState({x: 0, y: 0});
    const [res, setRes] = useState(2/(props.height/2));

    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        const buf = generateMandelbrot(center, props.width, props.height, res);
        var idata = context!.createImageData(props.width, props.height);
        idata.data.set(buf);
        context!.putImageData(idata, 0, 0);
        contextRef.current = context;

    },[]);
    
    const clickHandle = (event:MouseEvent) => {
        var newC = getNewCenter(event.nativeEvent.offsetX, event.nativeEvent.offsetY, res, props.width, props.height, center);
        setCenter(c=>(newC));
        setRes(a => a*.80);
        const buf = generateMandelbrot(newC, props.width, props.height, res*.95);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0);
    };

    const rightClickHandle = (event:MouseEvent) => {
        
        var c = {x: (event.nativeEvent.offsetX - props.width/2)*res, y: (event.nativeEvent.offsetY - props.height/2)*res};
        setRes(a => a*1.0525631);
        const buf = generateMandelbrot(c, props.width, props.height, res*1.0525631);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0); 
    };

    return <>
     <canvas 
                ref={canvasRef} 
                width={props.width} 
                height={props.height}
                onClick={clickHandle}
                onContextMenu={rightClickHandle}
            />
            <h1>
                {res.toString()}
            </h1>
            <h3>
                {center.x},{center.y}
            </h3>
           
        </>
}

export default Mandelbrot;