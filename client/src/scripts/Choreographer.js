import * as THREE from 'three';
import { AnimationMixer } from 'three';
import stage1 from '../config/stage1';
import { rotateAboutPoint, randomPick } from './Utilities';

export default class Choreographer {

    static createAnimationAction(object) {
        const mixer = new AnimationMixer(object);
        const clip = object.animations[0];
        return mixer.clipAction(clip);
    }

    static pickRandomIdleAnimation() {
        return randomPick([
            Choreographer.shiver, 
            Choreographer.windmill,
            Choreographer.rock,
            Choreographer.dance,
            Choreographer.phaseShiftedShiver,
            Choreographer.phaseShiftedRock
        ]);
    }
    
    static pickleRise(pickle, deltaTime, elapsedTime) {
        pickle.gameObject.rotation.x += pickle.behavior.pickleRiseRate * deltaTime / 1000;
        if (pickle.gameObject.rotation.x >= 0) {
            pickle.animate = Choreographer.pickRandomIdleAnimation();
        }
    }

    static pickleFall(pickle, deltaTime, elapsedTime) {
        pickle.gameObject.rotation.x -= pickle.behavior.pickleFallRate * deltaTime / 1000;
        if (pickle.gameObject.rotation.x <= -Math.PI / 2) {
            pickle.die();
        }
    }

    // static pickleIdle(pickle, deltaTime, elapsedTime) {
    //     // Choreographer.shiver(pickle, deltaTime, elapsedTime);
    //     Choreographer.windmill(pickle, deltaTime, elapsedTime);
    // }

    static shiver(pickle, deltaTime, elapsedTime) {
        // TODO move pivot
        let modifier = Math.random();
        pickle.gameObject.position.y += 0.0005 * Math.sin(0.005 * elapsedTime);
        pickle.gameObject.rotation.z += 0.0005 * Math.sin(0.005 * elapsedTime + Math.PI * modifier);
    }

    static phaseShiftedShiver(pickle, deltaTime, elapsedTime) {
        // TODO move pivot
        let modifier = Math.random();
        pickle.gameObject.position.y += 0.0005 * Math.sin(0.005 * elapsedTime + Math.PI);
        pickle.gameObject.rotation.z += 0.0005 * Math.sin(0.005 * elapsedTime + Math.PI * modifier);
    }

    static windmill(pickle, deltaTime, elapsedTime) {
        let theta = Math.sin(0.005*elapsedTime) / 1000;

        let x = pickle.gameObject.position.x;
        let y = pickle.gameObject.position.y;
        let z = pickle.gameObject.position.z;
        
        var bbox = new THREE.Box3();
        bbox.setFromObject(pickle.gameObject);

        let w = bbox.max.x - bbox.min.x;
        let h = bbox.max.y - bbox.min.y;

        // x += w / 2;
        y += h / 4;

        const subObject = pickle.gameObject.children[0];

        rotateAboutPoint(subObject, new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 1), theta, true);
    }

    static rock(pickle, deltaTime, elapsedTime) {
        pickle.gameObject.rotation.x += 0.003 * Math.sin(0.01 * elapsedTime);
    }

    static phaseShiftedRock(pickle, deltaTime, elapsedTime) {
        pickle.gameObject.rotation.x += 0.003 * Math.sin(0.01 * elapsedTime + Math.PI);
    }

    static dance(pickle, deltaTime, elapsedTime) {
        let theta = Math.sin(0.005*elapsedTime) / 2000;

        let x = pickle.gameObject.position.x;
        let y = pickle.gameObject.position.y;
        let z = pickle.gameObject.position.z;
        
        var bbox = new THREE.Box3();
        bbox.setFromObject(pickle.gameObject);

        let w = bbox.max.x - bbox.min.x;
        let h = bbox.max.y - bbox.min.y;

        // x += w / 2;
        y += h;

        const subObject = pickle.gameObject.children[0];

        rotateAboutPoint(subObject, new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 1), theta, true);
    }

    static hitFlicker(light) {
        light.intensity = 2;
        setTimeout(() => {
            light.intensity = 1
        }, 50);
    }

    static missFlicker(light) {
        light.intensity = 2;
        light.color = new THREE.Color(0xFF0000);
        setTimeout(() => {
            light.intensity = 1;
            light.color = new THREE.Color(0xFFFFFF);
        }, 50);
    }

    static dollyCamera(camera, elapsedTime) {
        // TODO decouple from stage1 config
        let m = (stage1.camera.zFinal - stage1.camera.zStart) / 1000;
        let f = m * elapsedTime + stage1.camera.zStart;
        let Z = Math.min(f, stage1.camera.zFinal);
        camera.position.z = Z;
    }
}