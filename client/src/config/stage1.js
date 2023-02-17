import background from '../images/scenery/background.jpg';
import backwall from '../images/scenery/backwall.png';
import barrel from '../images/scenery/barrel.png';
import mirrorbarrel from '../images/scenery/mirrorbarrel2.png';
import barrel2 from '../images/scenery/barrel2.png';

export default {
  camera: {
    position: [0, 2, 10],
    target: [0, 2, -10],
    fov: 8.5,
    near: 0.1,
    far: 1000,
    zStart: -15,
    zFinal: 10
  },
  light: {
    color: 0xFFFFFF,
    intensity: 1
  },
  scenery: {
    background: {
      file: background,
      position: [0, 0.7, -20],
      rotation: [0, 0, 0],
      scale: [3, 3.4, 1]
    },
    backwall: {
      file: backwall,
      position: [0, -0.2, -15],
      rotation: [0, 0, 0],
      scale: [4.2, 4.2, 1]
    },
    barrel1: {
      file: barrel,
      position: [-2.3, 0.5, -9],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    barrel2: {
      file: mirrorbarrel,
      position: [-0.8, 0.2, -8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    barrel3: {
      file: barrel,
      position: [0.71, 0.3, -8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    barrel4: {
      file: barrel2,
      position: [2.1, 0.5, -9],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    // barrel5: {
    //   file: barrel,
    //   position: [1, 1, -12],
    //   rotation: [0, 0, 0],
    //   scale: [0.8, 0.8, 1]
    // }
  },
  spawnLocations: [
    [-2.3, 0.5, -9.2],
    [-0.8, 0.5, -8.2],
    [0.71, 0.3, -8.1],
    [2.1, 0.5, -9.1],
    [-2.35, 1.4, -16],
    [0, 1.2, -15.2],
    [2.2, 1.3, -15.5],
    // [1, 1, -12.1]
  ]
};