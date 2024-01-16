export interface mandelProp
{
    width:number,
    height:number,
    iterations:number,
    sampleNo:number, 
    workers:number
}
export interface coordinatePair
{
    x:number,
    y:number
}
export function getTopLeftCoordinate(clickCoor:coordinatePair, currentCornerCoor:coordinatePair, Zoom:number)
{
    //const hypotenusePixelLength: number = Math.sqrt(clickPoint.x*clickPoint.x + clickPoint.y*clickPoint.y);
    //const hypotenuseCoorLength: number = Math.sqrt(Math.pow(clickCoor.x - currentCornerCoor.x, 2) + Math.pow(clickCoor.y - currentCornerCoor.y, 2));
    var y_dif = currentCornerCoor.y - clickCoor.y;
    var x_dif = clickCoor.x - currentCornerCoor.x;
    y_dif*=Zoom;
    x_dif*=Zoom;
    var ret = {x:clickCoor.x - x_dif, y:clickCoor.y+y_dif}
    return ret;


}
export function getClickCoordinate(x:number, y:number, res:number, corner:coordinatePair)
{
    return {x: corner.x + (x*res), y: corner.y - (y*res)};
}
export function setInitialData(
    canvasRef:React.RefObject<HTMLCanvasElement>, 
    contextRef:React.MutableRefObject<CanvasRenderingContext2D>,
    data: Uint8ClampedArray, x:number, y:number, width:number, height:number)
{
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    var idata = context!.createImageData(width, height);
    idata.data.set(data);
    context!.putImageData(idata, x, y);
    contextRef.current = context;
}
//export function setData(contextRef:React.MutableRefObject<CanvasRenderingContext2D>, data:Uint8ClampedArray, width:number, height:number, x:number, y:number)
//{
//    var idata = contextRef.current.createImageData(width, height);
//        idata.data.set(data);
//        contextRef.current.putImageData(idata, x, y);
//}

//export default {setData, setInitialData, getClickCoordinate, getTopLeftCoordinate};