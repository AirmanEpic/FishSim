import { main } from "./main";
import * as Three from 'three';

export class Renderable{
    main:main;
    material:Three.Material | null = null;
    mesh:Three.Mesh | null = null;

    constructor(main:main){
        this.main = main;
    }

    mount(){
        if (this.material && this.mesh){
            this.mesh.material = this.material;
            this.main.scene.add(this.mesh);
        }
    }
}