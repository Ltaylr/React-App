import {useRef, useEffect, useState} from 'react';

function getIterations(coor, maxIts)
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
function getColor(its, maxIts)
{
    //just grayscale for now
    return [255,255,255].map(x => x * its/maxIts);
}
function generateMandelbrot(center, width, height, res, maxIts=150)
{
    const topLeftCorner = {x: center.x - (width/2)*res, y: center.y + (height/2)*res};
    const buffer = new Uint8ClampedArray(width * height * 4);

    for(var i = 0; i < height; i++)
    {
        for(var j = 0; j < width; j++)
        {
            var clr = 255 - 255*(getIterations({x:topLeftCorner.x+(j*res),y:topLeftCorner.y-(i*res)}, maxIts)/maxIts);
            buffer[(i*width*4)+(j*4)] = clr;
            buffer[(i*width*4)+(j*4)+1] = clr;
            buffer[(i*width*4)+(j*4)+2] = clr;
            buffer[(i*width*4)+(j*4)+3] = 255;//grayscale for now
        }
    }

    return buffer;
}
function getNewCenter(offsetX, offsetY, res, width, height, oldCenter)
{
    var offset = {x:offsetX - width/2, y:offsetY - height/2}
    offset.x*=res;
    offset.y*=res;
    offset.x+=oldCenter.x;
    offset.y=oldCenter.y-offset.y;
    
    return offset;
     

}
function Mandelbrot(props)
{
    const canvasRef = useRef<canvas>(null);
    const contextRef = useRef(null);
    const [center, setCenter] = useState({x: 0, y: 0});
    const [res, setRes] = useState(2/(props.height/2));

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const buf = generateMandelbrot(center, props.width, props.height, res);
        var idata = context.createImageData(props.width, props.height);
        idata.data.set(buf);
        context.putImageData(idata, 0, 0);
        contextRef.current = context;
        return () => { canvas.removeEventListener('click', clickHandle)}


    },[]);
    
    const clickHandle = ({nativeEvent}) => {
        var newC = getNewCenter(nativeEvent.offsetX, nativeEvent.offsetY, res, props.width, props.height, center);
        
        setCenter(c=>(newC));
        setRes(a => a*.80);
        const buf = generateMandelbrot(newC, props.width, props.height, res*.95);
        var idata = contextRef.current.createImageData(props.width, props.height);
        idata.data.set(buf);
        contextRef.current.putImageData(idata, 0, 0);
    };

    const rightClickHandle = event => {
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