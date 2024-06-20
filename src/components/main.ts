import * as Three from 'three';
import { Renderable } from './renderable';
import { Fish } from './fish';

// ...

const controlsPromise = import('three/examples/jsm/controls/OrbitControls.js');


export class main{
    scene:Three.Scene = new Three.Scene();
    camera:Three.PerspectiveCamera = new Three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer:Three.WebGLRenderer = new Three.WebGLRenderer();
    renderObjects:Renderable[] = [];
    constructor(){
        this.renderer.setSize(window.innerWidth-100, window.innerHeight-100);
        document.body.appendChild(this.renderer.domElement); 
        this.camera.position.z = 5;
        this.scene.background = new Three.Color("#325899");
        // Create a light
        const light = new Three.AmbientLight( 0x404040 ); // soft white light
        this.scene.add(light);  

        //add a light from the top
        const pointLight = new Three.PointLight(0xffffff, 1);
        pointLight.position.set(0, 0, 2);
        this.scene.add(pointLight);

        this.animate();

        let newFish = new Fish(this);
        this.renderObjects.push(newFish);

        //mount all render objects
        this.renderObjects.forEach((renderObject) => {
            renderObject.mount();
        });

        //orbit controls
        // const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controlsPromise.then((module) => {
            const controls = new module.OrbitControls(this.camera, this.renderer.domElement);
          });
        
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}