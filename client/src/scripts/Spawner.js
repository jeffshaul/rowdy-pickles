import { shuffleArray } from "./Utilities";
import Pickle from "./Pickle";
import Observer from "./Observer";
import difficulty from "../config/difficulty";

export default class Spawner extends Observer {

    static Engine;

    constructor(scene, stage) {
        super();
        this.engine;
        this.scene = scene;
        this.difficulty = difficulty;
        this.pickles = [];
        this.unoccupiedSpawnLocations;
        this.IsAvailableSpawnLocation = true;
        this.isPlaying = false;
        this.timeSinceLastSpawn = 0;
        this.timeLastCalled;
        this.gameBegan;
        this.spawnInterval = this.difficulty.startingSpawnInterval;
    }

    checkForSpawn(deltaTime) {
        if (!this.isPlaying) {
            return;
        }
        let now = Date.now();
        let elapsedTime = now - this.gameBegan;
        this.timeSinceLastSpawn += deltaTime;
        this.timeLastCalled = now;
        if (this.unoccupiedSpawnLocations.length > 0) {
            if (this.timeSinceLastSpawn > this.spawnInterval) {
                this.timeSinceLastSpawn = 0;
                this.spawnInterval = this.calculateSpawnTimeout(elapsedTime);
                this.spawn();
            }
        } else {
            Spawner.Engine.overrun();
            this.isPlaying = false;
        }
        
    }

    // calculateSpawnTimeout(t) {
    //     // t is in milliseconds, compute spawn timeout in milliseconds
    //     let jitter = (t) => (t - this.difficulty.amplitude * Math.sin(this.difficulty.frequency * t));
    //     let m = -(this.difficulty.minimumSpawnInterval - this.difficulty.startingSpawnInterval) / jitter(this.difficulty.rampingDuration); 
    //     let ramp = -m * jitter(t) + this.difficulty.startingSpawnInterval;
    //     return Math.max(ramp, this.difficulty.minimumSpawnInterval);
    // }

    calculateSpawnTimeout(t) {
        let k = this.difficulty.k;
        let t0 = this.difficulty.t0;
        let logistic = -1 / (1 + Math.exp(-k * (t - t0)));
        let A = this.difficulty.tmax - this.difficulty.tbase;
        let B = this.difficulty.tmax;
        let linear = A * logistic + B;
        let oscillator = this.difficulty.oscillatorAmplitude * Math.sin(t);
        let F = linear + oscillator;
        return F;
    }

    // spawn() {
    //     if (this.isPlaying && this.unoccupiedSpawnLocations.length > 0) {
    //         shuffleArray(this.unoccupiedSpawnLocations);
    //         let spawnLocation = this.unoccupiedSpawnLocations.pop();
    //         this.spawnPickle(spawnLocation);
    //     } else {
    //         // out of spawn locations! TODO
    //         setTimeout(() => {
    //             if (this.unoccupiedSpawnLocations.length === 0) {
    //                 this.isPlaying ? Spawner.Engine.overrun() : pass;
    //                 this.IsAvailableSpawnLocation = false;
    //                 this.isPlaying = false;
    //             }                
    //         }, this.difficulty.gracePeriod)

    //     }        
    // }

    spawn() {
        shuffleArray(this.unoccupiedSpawnLocations);
        let spawnLocation = this.unoccupiedSpawnLocations.pop();
        this.spawnPickle(spawnLocation);
    }

    spawnPickle(spawnLocation) {
        var pickle = new Pickle(this.engine, spawnLocation);
        pickle.addObserver(this);
        this.pickles.push(pickle);
        this.scene.add(pickle.gameObject);
    }

    notify(event) {
        // right now only Subject is Pickle which sends itself on death
        let pickle = event;
        this.unoccupiedSpawnLocations.push(pickle.spawnLocation); // TODO only if pickle is in current stage
        this.IsAvailableSpawnLocation = true;
        this.pickles = this.pickles.filter((p) => {
            let pUUID = p.gameObject.uuid;
            let notifyingPickleUUID = pickle.gameObject.uuid;
            return pUUID !== notifyingPickleUUID;
        });
        this.scene.remove(pickle.gameObject);
    }

    resetClock() {
        this.gameBegan = Date.now();
    }

    /**
     * Load spawning points for the Spawner to use
     * 
     * The array of Object3Ds is transformed to an Array of [x,y,z]s
     * @param {*} spawns Array of Object3Ds
     */
    loadSpawnPoints(spawns) {
        const arr = [];

        spawns.forEach((spawn) => {
            const x = spawn.position.x;
            const y = spawn.position.y;
            const z = spawn.position.z;
            arr.push([x, y, z]);
        });

        this.unoccupiedSpawnLocations = arr;
    }
}