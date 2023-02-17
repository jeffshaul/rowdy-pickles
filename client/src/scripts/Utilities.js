import * as THREE from 'three';

/**
 * Import all items from a sister directory 
 * @param {*} r require.context object that maps from src filename to dist filename
 * @returns remapping to allow for access from child directory
 */
function importAll(r) {
    let remap = {};

    for (let i = 0; i < r.keys().length; i++) {
        let item = r.keys()[i];
        remap[item.replace('./', '')] = r(item);
    }

    return remap;
}

/**
 * Create a "billboard" using an image as its texture
 * @param {*} imageFile to be used as the texture
 * @returns a THREE.Object3D of the billboard's pivot
 */
function loadImageAsPlane(imageFile) {

    // load image as texture and adjust plane mesh's aspect ratio
    var geometry = new THREE.PlaneGeometry(1, 1);
    var mesh;
    var texture = new THREE.TextureLoader().load(imageFile, (texture) => {
        texture.needsUpdate = true;
        mesh.scale.set(texture.image.width / texture.image.height, 1.0, 1.0);
    });
    var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    mesh = new THREE.Mesh(geometry, material);

    // translate mesh local origin to bottom center
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    let bbHeight = boundingBox.max.y - boundingBox.min.y;
    mesh.geometry.translate(0, bbHeight / 2, 0);
    var pivot = new THREE.Object3D();
    pivot.add(mesh);
    return pivot;
}

function loadImageObjectAsPlane(imageObject) {
    // load image as texture and adjust plane mesh's aspect ratio
    console.log(imageObject.src);
    var geometry = new THREE.PlaneGeometry(1, 1);
    var mesh;
    var texture = new THREE.TextureLoader().load(imageObject.src, (texture) => {
        texture.needsUpdate = true;
        mesh.scale.set(texture.image.width / texture.image.height, 1.0, 1.0);
    });
    var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    mesh = new THREE.Mesh(geometry, material);

    // translate mesh local origin to bottom center
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    let bbHeight = boundingBox.max.y - boundingBox.min.y;
    mesh.geometry.translate(0, bbHeight / 2, 0);
    var pivot = new THREE.Object3D();
    pivot.add(mesh);
    return pivot;
}

function loadTexture(url) {
    return new Promise(resolve => {
        new THREE.TextureLoader().load(url, resolve);
    })
}

function createPlaneFromTexture(texture) {
    var geometry = new THREE.PlaneGeometry(1, 1);    
    var material = new THREE.MeshLambertMaterial({map: texture, transparent: true});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(texture.image.width / texture.image.height, 1.0, 1.0);

    // translate mesh local origin to bottom center
    const bbox = new THREE.Box3().setFromObject(mesh);
    let bbHeight = bbox.max.y - bbox.min.y;
    mesh.geometry.translate(0, bbHeight / 2, 0);
    
    // add pivot as parent of mesh
    var pivot = new THREE.Object3D();
    pivot.add(mesh);
    
    return pivot;
}

/**
 * Shuffle an array in-place
 * @param {*} array the array to be shuffled in-place
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Randomly pick an element from the array without modifying it
 * @param {*} array 
 * @returns a random element of the array
 */
function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

function iOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

export { importAll, loadImageAsPlane, loadImageObjectAsPlane, loadTexture, createPlaneFromTexture, shuffleArray, randomPick, randomInt, rotateAboutPoint, iOS };