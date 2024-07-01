import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, Sphere, SphereGeometry, Vector2, Vector3 } from "three";
import { Renderable } from "./renderable";
import { main } from "./main";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";
import { bezierDefinedCurve } from "./bezierDefinedCurve";

export class Fish extends Renderable{
    length:number = 8;
    maxWidth:number = 0.5;
    maxHeight:number = 1;
    rings:number = 40;
    ringSegments:RingSegment[] = [];
    animationFrame:number = 0;
    sideProfile:bezierDefinedCurve;
    dorsalProfile:bezierDefinedCurve
    rotationsLastFrame:Vector3[] = [];
    constructor(main:main){
        super(main);
        //create the "Dorsal" profile of the fish
        let tailPositionX = 0.82;
        this.dorsalProfile = new bezierDefinedCurve([
            new Vector3(0, 0, 0.8),
            new Vector3(0.32, 0.9, 0.17),
            new Vector3(tailPositionX-0.2, 0.4, 0),
            new Vector3(tailPositionX, 0.1, -0.01),
            new Vector3(1, 1, 0.1)
        ]);

        this.sideProfile = new bezierDefinedCurve([
            new Vector3(0, 0, 0.4),
            new Vector3(0.4, 0.5, 0.1),
            new Vector3(0.6, 0.5, 0.1),
            new Vector3(tailPositionX, 0.1, 0.1),
            new Vector3(1, 0, 0.1)
        ]);

        for (let i = 0; i < this.rings; i++){
            let ringSegment = new RingSegment(
                50,
                new Vector3(0,Math.PI/2,0),
                new Vector3(0,0,((i/this.rings) - 0.5) * this.length),
                this.sideProfile.getYfromX(i/this.rings),
                this.dorsalProfile.getYfromX(i/this.rings),
            );
            this.ringSegments.push(ringSegment);
            this.rotationsLastFrame.push(new Vector3(0,Math.PI/2,0));
        }
    }

    mount(){
        // this.ringSegments.forEach((ringSegment) => {
        //     ringSegment.lineSegments.forEach((lineSegment) => {
        //         let geometry = new SphereGeometry(0.1, 32, 32);
        //         let material = new MeshBasicMaterial({color: 0xffff00});
        //         let sphere = new Mesh(geometry, material);
        //         sphere.position.set(lineSegment.start.x, lineSegment.start.y, lineSegment.start.z);
        //         this.main.scene.add(sphere);
        //         console.log(lineSegment.start)
                
        //     });
        // });

        //create a 3D hull for the fish. Should be faces between the rings. No lines.
        let geometry = new BufferGeometry();
        let faces = []
        for (var i=1; i<this.ringSegments.length; i++){
            let ringSegment = this.ringSegments[i];
            let previousRingSegment = this.ringSegments[i-1];
            for (var j=0; j<ringSegment.lineSegments.length; j++){
                let lineSegment = ringSegment.lineSegments[j];
                let previousLineSegment = previousRingSegment.lineSegments[j];
                let thisFace = [
                    lineSegment.start,
                    lineSegment.end,
                    previousLineSegment.end,
                    previousLineSegment.start
                ];

                //create the faces
                faces.push(thisFace);                
            }
        }
        let vertices:any[] = [];
        faces.forEach((face) => {
            face.forEach((point) => {
                vertices.push(point.x, point.y, point.z);
            });
        });
        let indices = [];
        for (var i=0; i<faces.length; i++){
            indices.push(i*4, i*4+1, i*4+2);
            indices.push(i*4, i*4+2, i*4+3);
        }
        geometry.setIndex(indices);
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices
        ), 3));

        //compute normals
        geometry = BufferGeometryUtils.mergeVertices(geometry, 0.01);
        geometry.computeVertexNormals();
        geometry.normalizeNormals();


        let mat = new MeshPhongMaterial({color: 0xffffff, side: 2, shininess: 100, specular: 0xffffff})
        mat.flatShading = false
        let mesh = new Mesh(geometry, mat);
        this.mesh = mesh;
        this.main.scene.add(mesh);
    }

    animate(){

        this.ringSegments = [];
        let previousSegmentPosition = new Vector3(0,0,0);
        // let wigglet = new bezierDefinedCurve([
        //     new Vector3(0,0.6,0.01),
        //     new Vector3(0.5,0.8,0.01),
        //     new Vector3(1,1,0.01),
        //     new Vector3(3,20,0.01),
        // ]);

        // let wiggleforce = 0.1;

        // //where the "Wave" is at this point in time.
        // let wigglePos = wigglet.getYfromX(this.animationFrame/50);

        // let rotator = new bezierDefinedCurve([
        //     new Vector3(0,Math.PI/2,0.001),
        //     new Vector3(0.4,(Math.PI/2)+wiggleforce,0.01),
        //     new Vector3(wigglePos,(Math.PI/2)-wiggleforce,0.1),
        //     new Vector3(10,(Math.PI/2),0.01),
        // ])
        let rotForce = Math.PI/8;

        let newLastRotations = [];
        for (let i = 0; i < this.rings; i++){
            let unmovedVector = previousSegmentPosition.clone();
            let distance = this.length/this.rings;
            //to get the new position, we need to move in the direction of the previous segment's rotation, by the distance of the segment
            // using the rotation vector as the direction

            let thisRotation = new Vector3(0,Math.PI/2,0);
            let startPoint = Math.floor(this.rings/5)
            console.log(startPoint)
            if (i < startPoint){
                this.rotationsLastFrame[i] = new Vector3(0,Math.sin((this.animationFrame/100)*Math.PI*2)*rotForce + Math.PI/2,0);
                thisRotation = this.rotationsLastFrame[i];
            }else{
                thisRotation = this.rotationsLastFrame[i-1];
            }

            let rotatedVector = new Vector3(
                Math.cos(thisRotation.y) * distance,
                0,
                Math.sin(thisRotation.y) * distance,
            ).add(unmovedVector);



            let ringSegment = new RingSegment(
                50,
                thisRotation,
                rotatedVector,
                this.sideProfile.getYfromX(i/this.rings),
                this.dorsalProfile.getYfromX(i/this.rings),
            );
            this.ringSegments.push(ringSegment);
            // previousSegmentRotation = ringSegment.rotation;
            newLastRotations.push(thisRotation);
            previousSegmentPosition = rotatedVector;
        }

        //update the rotations
        this.rotationsLastFrame = newLastRotations;

        this.animationFrame++;
        if (this.animationFrame > 100){
            this.animationFrame = 0;
        }
    }
}

export class RingSegment{
    width:number;
    height:number;
    segments:number;
    lineSegments:LineSegment[] = [];
    rotation:Vector3 = new Vector3(0,0,0);
    constructor(segments:number, rotation:Vector3, basePos:Vector3, width:number, height:number){
        let phase = 0;
        this.width = width;
        this.height = height;
        this.segments = segments;
        let previousPoint = phaseToPoint(phase, rotation, width, height, basePos);
        for (let i = 0; i < segments+1; i++){
            let point = phaseToPoint(((2*Math.PI)/segments) * i, rotation, width, height, basePos);
            //add the new line segment
            this.lineSegments.push(new LineSegment(
                previousPoint,
                point
            ));
            previousPoint = point;
        }

    }
}

export class LineSegment{
    start:Vector3
    end:Vector3
    constructor(start:Vector3, end:Vector3){
        this.start = start;
        this.end = end;
    }
}

export function phaseToPoint(phase:number, rotation:Vector3, width:number, height:number, previousPoint:Vector3):Vector3{
    let phaseAngle = phase
    let x = (Math.cos(phaseAngle) * width) + previousPoint.x;
    let y = (Math.sin(phaseAngle) * height) + previousPoint.y;
    let z = previousPoint.z;
    //now rotate these points based on the rotation vector
    let x1 = x;
    let y1 = y;
    let z1 = z;
    //rotate x
    let x2 = x1;
    let y2 = y1 * Math.cos(rotation.x) - z1 * Math.sin(rotation.x);
    let z2 = y1 * Math.sin(rotation.x) + z1 * Math.cos(rotation.x);
    //rotate y
    let x3 = x2 * Math.cos(rotation.y) + z2 * Math.sin(rotation.y);
    let y3 = y2;
    let z3 = -x2 * Math.sin(rotation.y) + z2 * Math.cos(rotation.y);
    //rotate z
    let x4 = x3 * Math.cos(rotation.z) - y3 * Math.sin(rotation.z);
    let y4 = x3 * Math.sin(rotation.z) + y3 * Math.cos(rotation.z);
    let z4 = z3;

    return new Vector3(x4, y4, z4);
}

