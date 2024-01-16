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
var colorArray: Array<Function> = []
colorArray.push(simplePink);
colorArray.push(logPink);
export function getColor(index:number)
{
    return colorArray[index];
}

export default getColor;
