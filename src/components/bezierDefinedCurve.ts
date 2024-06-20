import { Bezier } from "bezier-js";
import { Vector2, Vector3 } from "three";
import { inverseLerp, lerp } from "three/src/math/MathUtils.js";

export class bezierDefinedCurve{
    curve:Bezier[]
    sLUT:Vector2[]
    constructor(points:Vector3[]){
        // the third value is the control point distance.
        this.curve = [];
        
        for (let i = 0; i < points.length-1; i++){
            let point1 = new Vector2(points[i].x, points[i].y)
            let point2 = new Vector2(0,0)
            if (i == 0){
                point2 = new Vector2(
                    lerp(points[i].x, points[i+1].x, 0.1),
                    lerp(points[i].y, points[i+1].y, 0.1)
                );
            } else {
                point2 = new Vector2(
                    points[i].x + points[i].z,
                    points[i].y
                );
            }

            let point3 = new Vector2(0,0)
            if (i == points.length-2){
                point3 = new Vector2(
                    lerp(points[i].x, points[i+1].x, 0.9),
                    lerp(points[i].y, points[i+1].y, 0.9)
                );
            } else {
                point3 = new Vector2(
                    points[i+1].x - points[i+1].z,
                    points[i+1].y
                );
            }

            let point4 = new Vector2(points[i+1].x, points[i+1].y)
            let curve = new Bezier(point1, point2, point3, point4);
            this.curve.push(curve);
        }

        this.sLUT = []
        this.curve.forEach((curve:Bezier) =>{
            let lut = curve.getLUT(50)
            lut.forEach((point)=>{
                this.sLUT.push(new Vector2(point.x,point.y))
            })
        })        
    }

    getYfromX(x:number){
        //get the closest t where T is the Nth point in the solidified look up table (sLUT)
        let xx = -1
        let i = 0
        //ensure i never gets beyond the limit of the solidified look up table
        while (xx < x && i < this.sLUT.length){
            xx = this.sLUT[i].x
            i += 1            
        }
        i -=1 
        
        //get this point and the next point
        let thisPoint = this.sLUT[i]
        let nextPoint = this.sLUT[i]

        //get the inverse lerped position between the two
        let ilerped = inverseLerp(thisPoint.x, nextPoint.x, x)
        //now get the lerped y
        return lerp(thisPoint.y, nextPoint.y, ilerped)
    }
}