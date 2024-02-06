interface colorPos {
    pos:number,
    col:Array<number>
}
export interface theme{
    colors: Array<colorPos>;
}
export var pinkAndBlue:theme = 
{
    colors:
    [{pos: 0.0, col:[0,0,0]},
    {pos: 0.2, col:[80,10,80]},
    {pos: 0.5, col:[180,125,90]},
    {pos: 0.8, col:[255,125,255]},
    {pos: 0.90,col:[20,20,140]},
    {pos: 1.0, col:[0,0,0]}]

}
export var theme2:theme = 
{
    colors:
    [{pos: 0.0, col:[0,0,0]},
    {pos: 0.3, col:[255,80,200]},
    //{pos: 0.8, col:[255,100,230]},
    {pos: 0.6, col:[30,10,120]},
    {pos: 0.9, col:[120,120,200]},
    {pos: 1.0, col:[0,0,0]}]

}
export var blackAndWhite: theme = {
    colors:
    [{pos: 0.0, col:[0,0,0]},
    {pos: 0.3, col:[255,255,255]},
    {pos: 1.0, col:[0,0,0]}]
}
const themeArray:Array<theme> = new Array<theme>(pinkAndBlue);

export function fillPalette(numberOfHues:number, paletteBuffer: Uint8ClampedArray, scale='linear', theme:theme=blackAndWhite)
{
    
    const step = 1/numberOfHues;
    var index = 0;
    for(var clr = 1; clr < theme.colors.length; clr++)
    {
        
        if(scale==='linear')
        {
            const clr1 = theme.colors[clr - 1];
            const clr2 = theme.colors[clr];
            var dif = (clr2.pos - clr1.pos)/step;
            const rStep = (clr2.col[0] - clr1.col[0])/dif;
            const gStep = (clr2.col[1] - clr1.col[1])/dif;
            const bStep = (clr2.col[2] - clr1.col[2])/dif;
            var tmpClr = [clr1.col[0], clr1.col[1], clr1.col[2]];
            for(var start = clr1.pos; start < clr2.pos; start += step)
            {
                paletteBuffer[index++] = tmpClr[0];
                paletteBuffer[index++] = tmpClr[1];
                paletteBuffer[index++] = tmpClr[2];
                tmpClr[0] += rStep;
                tmpClr[1] += gStep;
                tmpClr[2] += bStep;
            }
        }
        else if(scale==='log'){

        }
        else if(scale==='continuous')
        {

        }
    }
}
function simplePink(its:number, maxIts:number)
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
function logPink(its:number, maxIts:number)
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
export function colorTransition(colors:Array<{r:number,g:number, b:number}>, its:number, maxIts:number)
{
    
    if(its === maxIts)  return [0,0,0]
    const percentage = its/maxIts;
    const step = 100/colors.length;
    var place = 0;
    while(step*place < percentage)
    {
        place++;
    }
    const percentBetween = percentage;//(percentage - (place - 1)*step) / step;
    return [lerp(colors[place - 1].r, colors[place].r, percentBetween),
            lerp(colors[place - 1].g, colors[place].g, percentBetween),
            lerp(colors[place - 1].b, colors[place].b, percentBetween)]

}
function lerp(x:number, y:number, n:number)
{
    //get difference
    return x + (y - x)*n
}

var colorArray: Array<Function> = []
colorArray.push(simplePink);
colorArray.push(logPink);
export function getColor(index:number)
{
    return colorArray[index];
}

