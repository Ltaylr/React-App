import {useRef, useEffect, useState} from 'react';
import { MouseEvent, FormEvent } from 'react';
//import { Shaders, Node, GLSL} from 'gl-react';
import { Surface } from "gl-react-dom";
import REGL from 'regl'

function getBottomLeftCoordinate(clickCoor, currentCornerCoor, res)
{
    //const hypotenusePixelLength: number = Math.sqrt(clickPoint.x*clickPoint.x + clickPoint.y*clickPoint.y);
    //const hypotenuseCoorLength: number = Math.sqrt(Math.pow(clickCoor.x - currentCornerCoor.x, 2) + Math.pow(clickCoor.y - currentCornerCoor.y, 2));
    var y_dif = clickCoor.y - currentCornerCoor.y; 
    var x_dif = clickCoor.x - currentCornerCoor.x;
    y_dif*=.80;
    x_dif*=.80;
    var ret = {x:clickCoor.x - x_dif, y:clickCoor.y - y_dif}
    return ret;


}
function getClickCoordinate(x, y, res, corner, height)
{
    return {x: corner.x + (x*res), y: corner.y + ((height - y)*res)};
}

function drawMandelbrotFunc(reglContext, maxIts, fPoint, tPoint, width, height, samples=1)
{
    var drawMandelbrot = reglContext(
        {
            vert:`
            attribute vec2 coordinates;
            
            void main(){

                gl_Position = vec4(coordinates, 0.0, 1.0);

            }`,
            frag:`
            #ifdef GL_FRAGMENT_PRECISION_HIGH
                precision highp float;
            #else
                precision mediump float;
            #endif

            uniform vec2 u_resolution;
            uniform vec2 fromPoint;
            uniform vec2 toPoint;

            vec4 colorFunction(int its, int maxIts)
            {
                if(its == maxIts)
                {

                }
                else
                {

                }

                return vec4(0,0,0,0);
            }

            void main(){ 
                vec2 uv = gl_FragCoord.xy / u_resolution;
                float nextXcoor = (gl_FragCoord.x + 1.0) / u_resolution.x;
                
                vec2 dif = vec2(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y);
                vec2 coor = vec2((fromPoint.x + uv.x*dif.x), (fromPoint.y + uv.y*dif.y));
                const int maxIts = ${maxIts};
                const int samples = ${samples};

                float inc = (nextXcoor - uv.x) / float(samples);
                
                int its = 0;
                float zx = 0.0;
                float zy = 0.0;
                float zx2 = 0.0;
                float zy2 = 0.0;
                float xtemp = 0.0;

                for(int s = 0; s < samples; s++)
                {
                    //its = 0;
                    zx = 0.0;
                    zy = 0.0;
                    zx2 = 0.0;
                    zy2 = 0.0;
                    xtemp = 0.0;
                    
                    coor.x+=inc;
                    coor.y+=inc;

                    for(int i = 0; i < maxIts; i++)
                    {
                        xtemp = zx2 - zy2 + coor.x;
                        zy = 2.0*zx*zy + coor.y;
                        zx = xtemp;
                        zx2 = zx*zx;
                        zy2 = zy*zy;
                        its++;
                        if(zx2 + zy2 > 4.0) break;
                    }
                }
                xtemp = (log(float(its)/float(samples)))/log(float(maxIts)); //
                //xtemp = float(its)/float(maxIts);//
                if(its == maxIts) gl_FragColor = vec4(0.0,.0,0.0, 1.0);
                else
                {
                float temp2 = (1.0 - xtemp);// * xtemp;
                vec4 color1 = vec4(temp2*.05, temp2*.05, temp2*.2, 1.0);
                vec4 color2 = vec4(xtemp, xtemp*.3, xtemp*.87, 1.0);
                gl_FragColor = color1 + color2;
                }
                //else if(its < maxIts/2)
                //{
                //    gl_FragColor = vec4
                //}
                //else {
                //    gl_FragColor = vec4( xtemp, xtemp*.3, xtemp*.87, 1.0);
                //}
            }`,
            uniforms:{
                fromPoint: reglContext.prop('fromPoint'),
                toPoint: reglContext.prop('toPoint'),
                u_resolution: reglContext.prop('u_resolution')
            },
            attributes:
            {
                coordinates: [
                    [-1,-1],
                    [ 1,-1],
                    [ 1, 1],
                    [-1,-1],
                    [ -1,1],
                    [ 1, 1]
                             ]
                
                
            },
            count: 6
        })
        //,
        drawMandelbrot({fromPoint:[fPoint.x, fPoint.y], toPoint:tPoint, u_resolution:[width, height]})
}
function calculateToPoint(fromPoint, width, height, res, skewx=1, skewy=1)
{
    var x = fromPoint.x+(width*res);
    var y = fromPoint.y+(height*res)
    return [x, y];
}
function MandelbrotGL(props)
{
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [BottomLeftCoordinate, setBottomLeftCoordinate] = useState({x: -2.5, y: -1.4});
    const [TopRightCoordinate, setTopRightCoordinate] = useState({x: -2.5, y: -1.4});
    const [res, setRes] = useState(.0025);
    const [its, setIterations] = useState(200)
    const [samples, setSamples] = useState(props.sampleNo)

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("WebGLRenderingContext");
        const reglContext = REGL(canvas)
        var fromPoint = BottomLeftCoordinate;
        var toPoint = calculateToPoint(fromPoint,props.width, props.height,res);
        setTopRightCoordinate(p=>toPoint);

        drawMandelbrotFunc(reglContext, its, fromPoint,toPoint,props.width, props.height)

    },[]);

    const handleSubmit = (e) => {
        e.preventDefault()
        const canvas = canvasRef.current;
        const context = canvas.getContext("WebGLRenderingContext");
        const reglContext = REGL(canvas)
        drawMandelbrotFunc(reglContext, its, BottomLeftCoordinate,TopRightCoordinate,props.width, props.height,samples)

    }

    const clickHandle = (event) => {
        var clckCoor = getClickCoordinate(
            event.nativeEvent.offsetX, 
            event.nativeEvent.offsetY,
            res,
            BottomLeftCoordinate, props.height);
        var fromPoint = getBottomLeftCoordinate(
            clckCoor, BottomLeftCoordinate, res);

        setBottomLeftCoordinate(c=>(fromPoint));
        setRes(a => a*.80);
        const canvas = canvasRef.current;
        const context = canvas.getContext("WebGLRenderingContext");
        const reglContext = REGL(canvas)
        var toPoint = calculateToPoint(fromPoint, props.width, props.height, res*.8);
        setTopRightCoordinate(tr=>toPoint)
        drawMandelbrotFunc(reglContext, its, fromPoint, toPoint, props.width, props.height);

    };

    return <>
            <h4>
                Pixel Resolution: {res.toString()} , Bottom Left Corner: ({BottomLeftCoordinate.x},{BottomLeftCoordinate.y})
            </h4>
            <div>
                <canvas 
                    ref={canvasRef} 
                    width={props.width}
                    height={props.height}
                    onClick={clickHandle} 
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
export default MandelbrotGL;