import {getColor} from '../helperFiles/ColorFuncs'

function getIterations(coor, maxIts)
{
    var its = 0;
    var zx = 0;
    var zy = 0;
    var xtemp = 0;
    var zx2 = 0;
    var zy2 = 0;
    while(its < maxIts && (zx2 + zy2 < 4))
    {
        xtemp = zx2 - zy2 + coor.x;
        zy = 2*zx*zy + coor.y;
        zx = xtemp;
        zx2 = zx*zx;
        zy2 = zy*zy;
        its++;
    }

    return its;
}

function generateMandelbrot(topLeftCorner, width, height, res, maxIts=1000, samplesPerPixel=15, colorFunc=1 )
{
    const func = getColor(colorFunc);
    var start = performance.now();
    //const topLeftCorner = {x: center.x - (width/2)*res, y: center.y + (height/2)*res};
    const buffer = new Uint8ClampedArray(width * height * 4);

    for(var i = 0; i < height; i++)
    {
        var offset_i = i*width*4; //Precompute here doesn't speed up anything, compiler already does this. 
        for(var j = 0; j < width; j++)
        {
            var its = 0;
             for(var k = 0; k < samplesPerPixel; k++)
            {
                var inc = (res*k)/samplesPerPixel;
                its+=getIterations({x:topLeftCorner.x+(j*res)+inc,y:topLeftCorner.y-(i*res)+inc}, maxIts)
                
            }
            var clr = func((its/samplesPerPixel), maxIts);
            buffer[(offset_i)+(j*4)] = clr[0];
            buffer[(offset_i)+(j*4)+1] = clr[1];
            buffer[(offset_i)+(j*4)+2] = clr[2];
            buffer[(offset_i)+(j*4)+3] = 255;
        }
    }
    var end = performance.now();
    console.log(`   time to complete ${maxIts} iterations: ${end - start}`)
    return buffer;
}

export default generateMandelbrot;


