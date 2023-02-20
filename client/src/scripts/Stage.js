import * as THREE from 'three';
import { Vector3 } from 'three';
import Spawner from './Spawner';
import { loadTexture, importAll, createPlaneFromTexture } from './Utilities';
const mappedFilenames = importAll(require.context("../images/scenery/"));
import superstage from '../stages/superstage.gltf';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Stage {

    static sceneryImages = new Object();
    static sceneryTextures = new Map();
    static gltfScene;

    static renderer;

    // static preloadScenery(renderer, updateLoadProgressFunc) {
        
    //     Stage.renderer = renderer;
    //     const loadImage = src =>
    //         new Promise((resolve, reject) => {
    //             updateLoadProgressFunc();
    //             const img = new Image();
    //             img.onload = () => resolve(img);
    //             img.onerror = reject;
    //             img.src = src;
    //             return img;
    //         });


    //     const promises = [];
    //     for (const unmappedFilename in mappedFilenames) {
    //         let mappedFilename = mappedFilenames[unmappedFilename];
    //         const loadPromise = loadImage(mappedFilenames[unmappedFilename]).then((img) => {
    //             updateLoadProgressFunc();                
    //             Stage.sceneryImages[mappedFilename] = img;
    //             return loadTexture(img.src);                
    //         }).then((texture) => {
    //             texture.needsUpdate = true;
    //             Stage.sceneryTextures.set(mappedFilename, texture);
    //             renderer.initTexture(texture);
    //         });
    //         promises.push(loadPromise);
    //     }
    //     return Promise.all(promises);
    // }

    static preloadGLTF(renderer, updateLoadProgressFunc) {
        
        Stage.renderer = renderer;

        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                superstage, 
                (gltf) => {
                    Stage.gltf = gltf;
                    resolve();
                }, 
                (xhr) => {
                    updateLoadProgressFunc();
                }, 
                reject
            )
        });
        // loader.load(
        //     superstage, (gltf) => {
        //         console.log(gltf);
        //         Stage.gltfScene = gltf.scene;
        //     }, (xhr) => {
        //         updateLoadProgressFunc();
        //     }, (error) => {
        //         console.log('could not load gltf');
        //     }
        // );
    }

    constructor(stage) {
        this.camera, this.scene, this.light;
        this.renderer = Stage.renderer;
        // this.createCamera(stage.camera);
        this.createRenderer(); // sorta it's been created in Game now...refactor TODO
        this.createScene();
        this.loadGLTF();
        this.letThereBeLight(stage.light);
        // this.loadObjects(stage.scenery);
        this.spawner = new Spawner(this.scene, stage);
        this.spawner.loadSpawnPoints(this.stage1spawns);
    }

    // deprecate TODO
    createCamera(stageCamera) {
        let fov = stageCamera['fov'];
        let near = stageCamera['near'];
        let far = stageCamera['far'];
        let camera_pos = stageCamera['position'];
        let camera_target = stageCamera['target'];

        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
        this.camera.position.set(...camera_pos);
        this.camera.lookAt(new Vector3(...camera_target));
    }

    createRenderer() {
        // this.renderer = new THREE.WebGLRenderer();
        // this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.outputEncoding = THREE.LinearEncoding;
        document.body.appendChild(this.renderer.domElement);
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    loadGLTF() {
        this.scene.add( Stage.gltf.scene );
        this.camera = Stage.gltf.cameras[0];
        this.camera.animations = Stage.gltf.animations;
        
        this.stage1spawns = Stage.gltf.scene.children.filter((child) => {
            const name = child.name;
            if (name.includes('Stage1Spawn')) {
                return true;
            } else {
                return false;
            }        
        });

        this.stage2spawns = Stage.gltf.scene.children.filter((child) => {
            const name = child.name;
            if (name.includes('Stage2Spawn')) {
                return true;
            } else {
                return false;
            }        
        });

        this.stage3spawns = Stage.gltf.scene.children.filter((child) => {
            const name = child.name;
            if (name.includes('Stage3Spawn')) {
                return true;
            } else {
                return false;
            }        
        });
    }

    // probably deprecate TODO
    letThereBeLight(lightParams) {
        this.light = new THREE.AmbientLight(lightParams.color, lightParams.intensity);
        this.scene.add(this.light);
    }

    // deprecate TODO
    loadObjects(objects) {
        for (let i = 0; i < Object.keys(objects).length; i++) {
            let objectName = Object.keys(objects)[i];
            this.addObject(objects[objectName]);
        }
    }

    // deprecate TODO 
    addObject(obj) {
        let mappedFilename = obj.file;        
        let texture = Stage.sceneryTextures.get(mappedFilename);
        let pos = obj.position;
        let rot = obj.rotation;
        let scale = obj.scale;

        // var gameObject = loadImageObjectAsPlane(imageObject);
        var gameObject = createPlaneFromTexture(texture);
        gameObject.position.set(...pos);
        gameObject.rotation.set(...rot);
        gameObject.scale.set(...scale);
        this.scene.add(gameObject);
    }
}