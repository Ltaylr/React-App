
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

    //two more iterations reduces error term, source: http://linas.org/art-gallery/escape/escape.html
    xtemp = zx2 - zy2 + x;
    zy = 2*zx*zy + y;
    zx = xtemp;
    zx2 = zx*zx;
    zy2 = zy*zy;
    its++;

    xtemp = zx2 - zy2 + x;
    zy = 2*zx*zy + y;
    zx = xtemp;
    zx2 = zx*zx;
    zy2 = zy*zy;
    its++;

    const modu = Math.sqrt(zx2 + zy2);

    return its + 1 - Math.log2(Math.log2(modu));
}
function lerp(val1, val2, percent)
{
    return val1 + (percent * (val2 - val1));
}
function lerpColor(color1, color2, percent)
{
    return [lerp(color1[0], color2[0], percent),lerp(color1[1], color2[1], percent),lerp(color1[2], color2[2], percent)]
}
function getColor(samps, palette, mix=true, maxIts)
{
    var color = [0,0,0];
    
    for(var s = 0; s < samps.length; s++)
    {
        const perc = samps[s]/maxIts;
        for(var i = 1; i < palette.length; i++)
        {
            if(palette[i-1].pos <= perc && palette[i].pos >= perc)
            {
                const p = (perc - palette[i-1].pos)/(palette[i].pos - palette[i-1].pos);
                const col = lerpColor(palette[i-1].col, palette[i].col, p);
                color[0] += col[0];
                color[1] += col[1];
                color[2] += col[2];
            }
        }
    }
    color[0] /= samps.length;
    color[1] /= samps.length;
    color[2] /= samps.length;

    return color;
    //if(mix)
    //{
    //    
    //    for(var i = 0; i < samps.length; i++)
    //    {
    //        const ratio = (palette.length/3) / maxIts;
    //        var index = Math.round(ratio * samps[i])*3;
    //        color[0] += palette[index];
    //        color[1] += palette[index+1];
    //        color[2] += palette[index+2];
    //    }
    //    
    //}
    //else{
//
    //    var sum = 0;
    //    for(var i = 0; i < samps.length; i++)
    //    {
    //        sum+=samps[i];
    //    }
    //    sum /= samps.length;
    //    sum *= 3;
    //    sum = Math.round(sum);
    //    color[0] = palette[sum];
    //    color[1] = palette[sum+1];
    //    color[2] = palette[sum+2];
    //}

    return color;
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
            var sampArr = [];
            for(var k = 0; k < samplesPerPixel; k++)
            {
                var inc = (res*k)/samplesPerPixel;
                its=getIterations(x+inc, y+inc, maxIts)
                sampArr.push(its);
            }
            offset_j += 4;
            var offset = offset_i + offset_j;
            var clrIndex = Math.round((its/samplesPerPixel)*3);//func((its/samplesPerPixel), maxIts);
            const color = getColor(sampArr, palette, samplesPerPixel>1, maxIts);
            buffer[offset] = color[0];
            buffer[offset+1] = color[1];
            buffer[offset+2] = color[2];
            buffer[offset+3] = 255;
        }
    }
}
var hasBuffer = false;
var buffer = null;
self.addEventListener('message', async function(e) {
    const props = e.data.props;
    const buffer = new Uint8ClampedArray(e.data.buffer);
    //var palette = new Uint8ClampedArray(e.data.palette);
    generateMandelbrot(props.topLeftCoor,props.width,props.height,props.resolution, props.iterations, props.sampleNo, e.data.theme.colors, buffer);
    //const imgData = new ImageData(buffer, props.width, props.height);
    self.postMessage({id:e.data.id});
    
    }, false);
