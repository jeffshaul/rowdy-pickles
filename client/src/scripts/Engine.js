// import _ from 'lodash';
import * as THREE from 'three';
import Stage from './Stage';
import Spawner from './Spawner';
import stage1 from '../config/stage1';
import Choreographer from './Choreographer';
import Pickle from './Pickle';
import difficulty from '../config/difficulty';
import HUD from './HUD';

export default class Engine {
    constructor() {
        this.stage = new Stage(stage1);
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.animationBegan = Date.now();
        this.lastAnimation = Date.now();
        this.maxMisses = difficulty.max_misses;
        this.kills = 0;
        Pickle.Engine = this;
        Spawner.Engine = this;

        this.cameraMixer = new THREE.AnimationMixer(this.stage.camera);
        this.cameraClip = this.stage.camera.animations[0];
        this.cameraAction = this.cameraMixer.clipAction(this.cameraClip);

        this.boundStartGame = this.startGame.bind(this);
        window.addEventListener('resize', this.onWindowResize.bind(this));
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // true for mobile device
            window.addEventListener('touchend', this.boundStartGame);
        } else {
            // false for not mobile device
            window.addEventListener('click', this.boundStartGame);
        }      
    }

    startGame() {
        // suppress touches if user is still in portrait
        if (window.innerHeight > window.innerWidth) {
            return;
        }

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // true for mobile device
            window.removeEventListener('touchend', this.boundStartGame);
            this.boundOnTouch = this.onTouch.bind(this);
            window.addEventListener('touchend', this.boundOnTouch);
        } else {
            // false for not mobile device
            window.removeEventListener('click', this.boundStartGame);
            this.boundOnClick = this.onClick.bind(this);
            window.addEventListener('click', this.boundOnClick);
        }        
        HUD.countdown(this); // will callback to Engine.beginSpawning
    }

    beginSpawning() {
        this.cameraAction.play();
        this.stage.spawner.engine = this; // eww refactor!! TODO
        this.stage.spawner.isPlaying = true;
        this.stage.spawner.resetClock();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // timing stuff
        let now = Date.now();
        let deltaTime = now - this.lastAnimation;
        let elapsedTime = now - this.animationBegan;
        this.lastAnimation = now;
        this.stage.spawner.timeLastCalled = now;

        // dolly TODO move out
        // Choreographer.dollyCamera(this.stage.camera, elapsedTime);
        this.cameraMixer.update(deltaTime / 1000);

        // update game
        this.stage.spawner.checkForSpawn(deltaTime);
        this.stage.spawner.pickles.forEach((pickle) => {
            pickle.animate(pickle, deltaTime, elapsedTime);
        });

        this.stage.renderer.render(this.stage.scene, this.stage.camera);
    }

    onClick(event) {
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        this.pointer.x = (event.offsetX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.offsetY / window.innerHeight) * 2 + 1;

        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.pointer, this.stage.camera);

        // calculate objects intersecting the picking ray
        // pass through transparent pixels
        let pickles = this.stage.spawner.pickles.map(pickle => pickle.gameObject);
        let intersects = this.raycaster.intersectObjects(pickles);
        let isHit = false;
        for (let i = 0; i < intersects.length; i++) {
            let intersect = intersects[i];
            let uuid = intersect.object.parent.uuid;
            let pickle = this.findPickleByUUID(uuid);
            isHit = isHit || pickle.checkForHit(intersect);
        }

        // // the solution to callback hell!
        // // but i have repented and ascend to purgatory
        // Promise.all(isHitPromises).then((results) => {
        //     let isHit = results.some((result) => result === true);
        //     if (!isHit) {
        //         // miss
        //         this.reactToMiss();
        //     }
        // });

        if (!isHit) {
            // miss
            this.reactToMiss();
        }
    }

    findPickleByUUID(uuid) {
        let pickles = this.stage.spawner.pickles;
        for (let i = 0; i < pickles.length; i++) {
            let pickle = pickles[i];
            if (pickle.gameObject.uuid === uuid) {
                return pickle;
            } else {
                // TODO
            }
        }
    }

    reactToHit() {
        console.log('reacting to hit');
        this.kills++;
        HUD.updateKills(this.kills);
        Choreographer.hitFlicker(this.stage.light);
        // TODO notify server of kill (include session UUID)
    }

    reactToMiss() {
        this.maxMisses--;
        HUD.loseLife(this.maxMisses);
        Choreographer.missFlicker(this.stage.light);
        if (this.maxMisses === 0) {
            this.missedTooManyTimes();
        }
    }

    overrun() {
        if (this.kills >= difficulty.requiredKills) {
            HUD.displayGameOverHUD('win');
        } else {
            HUD.displayGameOverHUD('overrun');
        }        
        this.checkForHighScore();
        this.endGame();
    }

    missedTooManyTimes() {
        if (this.kills >= difficulty.requiredKills) {
            HUD.displayGameOverHUD('win');
        } else {
            HUD.displayGameOverHUD('miss');
        }        
        this.stage.spawner.isPlaying = false;
        this.checkForHighScore();
        this.endGame();
    }

    checkForHighScore() {
        const storedScore = localStorage.getItem('highscore');
        if (storedScore == null || this.kills > storedScore) {
            // high score!
            localStorage.setItem('highscore', this.kills);
            HUD.stampHighScore();
        }
    }

    endGame() {
        window.removeEventListener('click', this.boundOnClick);
        window.removeEventListener('touchend', this.boundOnTouch);
        // TODO notify server of game end
    }

    onTouch(event) {
        // touch events are a little different from mouse events
        // only difference is that there's an array of touches and
        // use clientX instead of offsetX.  why?  idk        
        event = event.changedTouches[0];

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // update the picking ray with the camera and pointer position
        this.raycaster.setFromCamera(this.pointer, this.stage.camera);

        // calculate objects intersecting the picking ray
        // pass through transparent pixels
        let pickles = this.stage.spawner.pickles.map(pickle => pickle.gameObject);
        let intersects = this.raycaster.intersectObjects(pickles);
        let isHitPromises = [];
        for (let i = 0; i < intersects.length; i++) {
            let intersect = intersects[i];
            let uuid = intersect.object.parent.uuid;
            let pickle = this.findPickleByUUID(uuid);
            isHitPromises.push(pickle.checkForHit(intersect));
        }

        // the solution to callback hell!
        Promise.all(isHitPromises).then((results) => {
            let isHit = results.some((result) => result === true);
            if (!isHit) {
                // miss
                this.reactToMiss();
            }
        });
    }

    onWindowResize() {
        this.stage.camera.aspect = window.innerWidth / window.innerHeight;
        this.stage.camera.updateProjectionMatrix();
        this.stage.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}