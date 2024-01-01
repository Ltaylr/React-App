import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
import { Shaders, Node, GLSL} from 'gl-react';
import { Surface } from "gl-react-dom";

interface mandelProp
{
    width:number,
    height:number,
    iterations:number
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
function getColor(its:number, maxIts:number)
{
    //just grayscale for now
    if(its==maxIts) return [0,0,0];
    
    var div:number = Math.log(its)/Math.log(maxIts);
    //var div2 = Math.abs(div - .5)
    var color = [255*div,80*div, 200*div];
    //if(its > maxIts*.5)
    //{
    //    color = [255*div,80*div, 200*div]
    //}
    return color;
}
function generateMandelbrot(topLeftCorner:coordinatePair, width:number, height:number, res:number, maxIts=1000)
{
    //const topLeftCorner = {x: center.x - (width/2)*res, y: center.y + (height/2)*res};
    const buffer = new Uint8ClampedArray(width * height * 4);

    for(var i = 0; i < height; i++)
    {
        var offset_i = i*width*4; //Precompute here doesn't speed up anything, compiler already does this. 
        for(var j = 0; j < width; j++)
        {

            var clr =getColor(getIterations({x:topLeftCorner.x+(j*res),y:topLeftCorner.y-(i*res)}, maxIts),maxIts);
            buffer[(offset_i)+(j*4)] = clr[0];
            buffer[(offset_i)+(j*4)+1] = clr[1];
            buffer[(offset_i)+(j*4)+2] = clr[2];
            buffer[(offset_i)+(j*4)+3] = 255;
        }
    }

    return buffer;
}

function getTopLeftCoordinate(clickCoor:coordinatePair, currentCornerCoor:coordinatePair, res:number)
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
function getClickCoordinate(x:number, y:number, res:number, corner:coordinatePair)
{
    return {x: corner.x + (x*res), y: corner.y - (y*res)};
}
function Mandelbrot(props:mandelProp)
{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D>(null!);
    const [TopLeftCoordinate, setTopLeftCoordinate] = useState({x: -3, y: 2});
    const [res, setRes] = useState(2/(props.height/2));
    const [its, setIterations] = useState(200)
    const handleSubmit = (e:FormEvent) => {
        e.preventDefault()
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res, its);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0);

    }
    useEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;
        const buf = generateMandelbrot(TopLeftCoordinate, props.width, props.height, res,  props.iterations);
        var idata = context!.createImageData(props.width, props.height);
        idata.data.set(buf);
        context!.putImageData(idata, 0, 0);
        contextRef.current = context;

    },[]);
    
    const clickHandle = (event:MouseEvent) => {
        var newC = getTopLeftCoordinate(
            getClickCoordinate(
                event.nativeEvent.offsetX, 
                event.nativeEvent.offsetY,
                res,
                TopLeftCoordinate), TopLeftCoordinate, res);

        setTopLeftCoordinate(c=>(newC));
        setRes(a => a*.80);
        const buf = generateMandelbrot(newC, props.width, props.height, res*.80, its);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0);
    };

    const rightClickHandle = (event:MouseEvent) => {
        
        var c = {x: (event.nativeEvent.offsetX - props.width/2)*res, y: (event.nativeEvent.offsetY - props.height/2)*res};
        setRes(a => a*1.0525631);
        const buf = generateMandelbrot(c, props.width, props.height, res*1.0525631, its);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0); 
    };

    return <>
            <h4>
                Pixel Resolution: {res.toString()} , Top Left Corner: ({TopLeftCoordinate.x},{TopLeftCoordinate.y})
            </h4>
            <canvas 
                ref={canvasRef} 
                width={props.width} 
                height={props.height}
                onClick={clickHandle}
                onContextMenu={rightClickHandle}
            />
            <div>
                <form onSubmit={handleSubmit}>
                        <input type="text" value={its} onChange={(e) => setIterations(its => Number(e.target.value))}/>
                        <button type="submit">submit</button>
                </form>
            </div>
        </>
}

export default Mandelbrot;