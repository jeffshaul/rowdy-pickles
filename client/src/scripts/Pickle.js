import * as THREE from 'three';
import Choreographer from "./Choreographer";
import Subject from "./Subject";
import { loadTexture, importAll, createPlaneFromTexture, randomPick, shuffleArray } from "./Utilities";
import pickleBehavior from "../config/pickleBehavior";
const pickleImageFilenames = Object.values(importAll(require.context("../images/pickles/")));

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', {
    willReadFrequently: true
});
// document.body.appendChild(canvas);

export default class Pickle extends Subject {

    static Engine;

    static pickleImages = [];
    static pickleTextures = new Map();

    static preloadPickleImages(renderer, updateLoadProgressFunc) {
        const loadImage = src =>
            new Promise((resolve, reject) => {
                updateLoadProgressFunc();
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
                return img;
            });

        const promises = [];
        shuffleArray(pickleImageFilenames);
        const shuffledPickles = pickleImageFilenames.slice(0, pickleBehavior.picklesToImport);
        shuffledPickles.forEach((image) => {
            const loadPromise = loadImage(image).then((img) => {
                updateLoadProgressFunc();
                Pickle.pickleImages.push(img);
                return loadTexture(img.src);                
            }).then((texture) => {
                texture.needsUpdate = true;
                texture.encoding = THREE.sRGBEncoding;
                Pickle.pickleTextures.set(image, texture);
                renderer.initTexture(texture);
            });
            promises.push(loadPromise);
        });
        return Promise.all(promises);
    }

    constructor(engine, spawnLocation) {
        super();
        this.engine = engine;
        this.image = randomPick(Pickle.pickleImages);
        this.texture = Pickle.pickleTextures.get(this.image.src);
        this.animate = Choreographer.pickleRise;
        this.spawnLocation = spawnLocation;
        this.behavior = pickleBehavior;

        this.gameObject = createPlaneFromTexture(this.texture);
        this.gameObject.position.set(...this.spawnLocation);
        this.gameObject.rotation.set(-Math.PI / 2, 0, 0);
        this.gameObject.scale.set(...this.behavior.pickleScale);
    }

    checkForHit(intersect) {     
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.drawImage(this.image, 0, 0);

        let hitX = Math.floor(intersect.uv.x * this.image.width);
        let hitY = this.image.height - Math.floor(intersect.uv.y * this.image.height);
        let alpha = ctx.getImageData(hitX, hitY, 1, 1).data[3];
        ctx.clearRect(0, 0, this.image.width, this.image.height);

        if (alpha !== 0) {
            this.takeHit();
            return true;
        } else {
            return false;
        }
    }

    takeHit() {
        this.animate = Choreographer.pickleFall;
        this.engine.reactToHit();
    }

    die() {
        this.notifyObservers(this);
    }
}