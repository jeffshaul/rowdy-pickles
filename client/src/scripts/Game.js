import Engine from './Engine';
import HUD from './HUD';
import Pickle from './Pickle';
import Stage from './Stage';
import $ from 'jquery';
import * as THREE from 'three';

export default class Game {
    constructor() {
        this.loadProgress = 0;
        const renderer = this.createRenderer();

        let promises = [];
        promises.push(Pickle.preloadPickleImages(renderer, this.updateLoadProgress.bind(this)));
        // promises.push(Stage.preloadScenery(renderer, this.updateLoadProgress.bind(this)));
        promises.push(Stage.preloadGLTF(renderer, this.updateLoadProgress.bind(this)));            
        Promise.all(promises).then(() => {
            setTimeout(() => {
                $('#loadingScreen').css('z-index', '-1');
                $('#loadingScreen').hide();
    
                this.engine = new Engine();
                this.engine.animate();
            }, 300);
        });               
    }

    updateLoadProgress() {
        this.loadProgress++;
        HUD.updateLoadingScreen(this.loadProgress);
    }

    createRenderer() {
        const renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        return renderer;
    }
}