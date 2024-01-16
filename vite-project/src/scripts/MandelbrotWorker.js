function simplePink(its, maxIts)
{
    if(its==maxIts) return [0,0,0];
    
    var div = its/maxIts;//Math.log(its)/Math.log(maxIts);
    //var div2 = Math.abs(div - .5)
    var color = [255*div,80*div, 200*div];
    //if(its > maxIts*.5)
    //{
    //    color = [255*div,80*div, 200*div]
    //}
    return color;
}
function logPink(its, maxIts)
{
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
var colorArray = []
colorArray.push(simplePink);
colorArray.push(logPink);
function getColor(index)
{
    return colorArray[index];
}

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
//function getColor(its, maxIts)
//{
//    //just grayscale for now
//    if(its==maxIts) return [0,0,0];
//    
//    var div = its/maxIts;//Math.log(its)/Math.log(maxIts);
//    //var div2 = Math.abs(div - .5)
//    var color = [255*div,80*div, 200*div];
//    //if(its > maxIts*.5)
//    //{
//    //    color = [255*div,80*div, 200*div]
//    //}
//    return color;
//}
function generateMandelbrot(topLeftCorner, width, height, res, maxIts=1000, samplesPerPixel=1, colorFunc=simplePink, buffer)
{
    //const topLeftCorner = {x: center.x - (width/2)*res, y: center.y + (height/2)*res};
    //const buffer = new Uint8ClampedArray(width * height * 4);

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
            var clr = colorFunc((its/samplesPerPixel), maxIts);
            buffer[(offset_i)+(j*4)] = clr[0];
            buffer[(offset_i)+(j*4)+1] = clr[1];
            buffer[(offset_i)+(j*4)+2] = clr[2];
            buffer[(offset_i)+(j*4)+3] = 255;
        }
    }

    return buffer;
}

self.addEventListener('message', function(e) {
    const props = e.data.props;
    var buffer = new Uint8ClampedArray(e.data.buffer);
    //var corner = {x:props.topLeftCoor.x + ((props.resolution*props.width) * (e.data.id/e.data.totalWorkers)), y:props.topLeftCoor.y};
    generateMandelbrot(props.topLeftCoor,props.width,props.height,props.resolution, props.iterations, props.sampleNo, colorArray[1], buffer);
    
    self.postMessage({id:e.data.id})//,[buffer.buffer]);
    
    }, false);
//onmessage = function (e)
//{
//    //debugger;
//    //var corner = {x:props.topLeftCoor.x + (props.resolution * (props.width/e.i)), y:props.topLeftCoor.y};
//    //console.log(corner, props, e.i);
//    //var buf = generateMandelbrot(corner,props.width/e.i,props.height,props.resolution, props.iterations, props.samples)
//    this.postMessage({workerNum:e.i});
//}