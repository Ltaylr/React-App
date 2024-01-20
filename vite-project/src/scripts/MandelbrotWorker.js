
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

function generateMandelbrot(topLeftCorner, width, height, res, maxIts=1000, samplesPerPixel=1, palette, buffer)
{

    for(var i = 0; i < height; i++)
    {
        var offset_i = i*width*4; //Precompute here doesn't speed up anything, compiler already does this.
        var y = topLeftCorner.y-(i*res);
        var offset_j = -4;
        var j_res = -res;
        for(var j = 0; j < width; j++)
        {
            var its = 0;
            j_res+=res;
            var x = topLeftCorner.x+(j_res);
            for(var k = 0; k < samplesPerPixel; k++)
            {
                var inc = (res*k)/samplesPerPixel;
                its+=getIterations(x+inc, y+inc, maxIts)
                
            }
            offset_j += 4;
            var offset = offset_i + offset_j;
            var clrIndex = Math.round((its/samplesPerPixel)*3);//func((its/samplesPerPixel), maxIts);
            buffer[offset] = palette[clrIndex];
            buffer[offset+1] = palette[clrIndex+1];
            buffer[offset+2] = palette[clrIndex+2];
            buffer[offset+3] = 255;
        }
    }
}
var hasBuffer = false;
var buffer = null;
self.addEventListener('message', async function(e) {
    const props = e.data.props;
    const buffer = new Uint8ClampedArray(e.data.buffer);
    var palette = new Uint8ClampedArray(e.data.palette);
    generateMandelbrot(props.topLeftCoor,props.width,props.height,props.resolution, props.iterations, props.sampleNo, palette, buffer);
    
    self.postMessage({id:e.data.id, buffer:buffer});
    
    }, false);
