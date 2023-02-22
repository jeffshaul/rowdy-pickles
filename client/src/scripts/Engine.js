import $ from 'jquery';
import * as THREE from 'three';
import Stage from './Stage';
import Spawner from './Spawner';
import stage1 from '../config/stage1';
import Choreographer from './Choreographer';
import Pickle from './Pickle';
import difficulty from '../config/difficulty';
import HUD from './HUD';
import Socket from './Socket';

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

        // move to Choreographer TODO
        // opening dolly back
        this.cameraMixer = new THREE.AnimationMixer(this.stage.camera);

        this.openingDollyClip = this.stage.camera.animations[2];
        this.dollyToStage2Clip = this.stage.camera.animations[0];
        this.dollyToStage3Clip = this.stage.camera.animations[1]; 

        this.openingAnimation = this.cameraMixer.clipAction(this.openingDollyClip);
        this.openingAnimation.setLoop(THREE.LoopOnce);
        this.openingAnimation.clampWhenFinished = true;
        this.openingAnimation.play();

        // camera transition animation to stage 2
        this.stage2Animation = this.cameraMixer.clipAction(this.dollyToStage2Clip);
        this.stage2Animation.setLoop(THREE.LoopOnce);
        this.stage2Animation.clampWhenFinished = true;

        // camera transition animation to stage 3
        this.stage3Animation = this.cameraMixer.clipAction(this.dollyToStage3Clip);
        this.stage3Animation.setLoop(THREE.LoopOnce);
        this.stage3Animation.clampWhenFinished = true;

        // this.boundStartGame = this.startGame.bind(this);
        window.addEventListener('resize', this.onWindowResize.bind(this));
        // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        //     // true for mobile device
        //     window.addEventListener('touchend', this.boundStartGame);
        // } else {
        //     // false for not mobile device
        //     window.addEventListener('click', this.boundStartGame);
        // }
        
        // add onclick event to play btn
        $('#play-btn').on('click', (event) => {
            event.stopPropagation();
            this.startGame();
        });
    }

    startGame() {
        // suppress touches if user is still in portrait
        if (window.innerHeight > window.innerWidth) {
            return;
        }

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // true for mobile device
            // window.removeEventListener('touchend', this.boundStartGame);
            this.boundOnTouch = this.onTouch.bind(this);
            window.addEventListener('touchend', this.boundOnTouch);
        } else {
            // false for not mobile device
            // window.removeEventListener('click', this.boundStartGame);
            this.boundOnClick = this.onClick.bind(this);
            window.addEventListener('click', this.boundOnClick);
        }        
        HUD.countdown(this); // will callback to Engine.beginSpawning
    }

    beginSpawning() {
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

        // update camera mixer
        this.cameraMixer.update(deltaTime / 1000);

        // update game entities
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
        this.kills++;
        HUD.updateKills(this.kills);

        if (this.kills === difficulty.requiredKills) {
            // advance to stage 2
            this.openingAnimation.stop();
            this.stage2Animation.play();
            this.stage.spawner.loadSpawnPoints(this.stage.stage2spawns);
        }

        if (this.kills === difficulty.stage2requiredKills) {
            // advance to stage 3
            this.stage2Animation.stop();
            this.stage3Animation.play();
            this.stage.spawner.loadSpawnPoints(this.stage.stage3spawns);
        }

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