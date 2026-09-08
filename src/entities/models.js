import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ORBIT_CONFIG } from '../config/constants.js';

export function createModelManager(scene) {
  const gltfLoader = new GLTFLoader();

  const loadingOverlay = document.getElementById('loading-overlay');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const loaderTitle = document.getElementById('loader-title');

  // Models & Mixers State
  const models = {
    blackhole: null,
    earth: null,
    ship: null,
    satellite: null,
    ufo: null
  };

  const mixers = {
    blackhole: null,
    earth: null,
    ship: null,
    satellite: null,
    ufo: null
  };

  // Orbital angles
  let earthOrbitAngle = 0;
  let satelliteLocalAngle = 0;
  let shipOrbitAngle = 1.8;
  let ufoOrbitAngle = 4.5;

  function loadAll(onComplete) {
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    if (loaderTitle) loaderTitle.innerText = "Carregando Universo 3D & Naves Espaciais...";
    if (progressBar) progressBar.style.width = '5%';
    if (progressText) progressText.innerText = 'Carregando Buraco Negro Gigante, Terra, Naves e Satélites 3D...';

    const totalModels = 5;
    let loadedCount = 0;

    const checkFinished = () => {
      loadedCount++;
      if (progressBar) progressBar.style.width = `${Math.round((loadedCount / totalModels) * 100)}%`;
      if (progressText) progressText.innerText = `Carregados ${loadedCount} de ${totalModels} modelos 3D...`;
      if (loadedCount >= totalModels) {
        setTimeout(() => {
          if (loadingOverlay) loadingOverlay.classList.add('hidden');
          if (onComplete) onComplete();
        }, 400);
      }
    };

    // 1. Blackhole
    gltfLoader.load('/models/blackhole_optimized.glb', (gltf) => {
      const model = gltf.scene;
      models.blackhole = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 6.0 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixers.blackhole = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixers.blackhole.clipAction(clip).play());
      }
      checkFinished();
    }, undefined, (err) => {
      console.error('Erro ao carregar Blackhole:', err);
      checkFinished();
    });

    // 2. Planet Earth
    gltfLoader.load('/models/planet_earth.glb', (gltf) => {
      const model = gltf.scene;
      models.earth = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.6 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);
      model.position.set(ORBIT_CONFIG.earthRadius, 0, 0);
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixers.earth = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixers.earth.clipAction(clip).play());
      }
      checkFinished();
    }, undefined, (err) => {
      console.error('Erro ao carregar planet_earth.glb:', err);
      checkFinished();
    });

    // 3. Space Ship UB-65
    gltfLoader.load('/models/nave_model_ub-65.glb', (gltf) => {
      const model = gltf.scene;
      models.ship = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.8 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);
      model.position.set(
        Math.cos(shipOrbitAngle) * ORBIT_CONFIG.shipRadius,
        1.2,
        Math.sin(shipOrbitAngle) * ORBIT_CONFIG.shipRadius
      );
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixers.ship = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixers.ship.clipAction(clip).play());
      }
      checkFinished();
    }, undefined, (err) => {
      console.error('Erro ao carregar nave_model_ub-65.glb:', err);
      checkFinished();
    });

    // 4. Space Satellite
    gltfLoader.load('/models/space_satellite.glb', (gltf) => {
      const model = gltf.scene;
      models.satellite = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.4 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixers.satellite = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixers.satellite.clipAction(clip).play());
      }
      checkFinished();
    }, undefined, (err) => {
      console.error('Erro ao carregar space_satellite.glb:', err);
      checkFinished();
    });

    // 5. UFO Scout Ship
    gltfLoader.load('/models/nave_espacial_ufo.glb', (gltf) => {
      const model = gltf.scene;
      models.ufo = model;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.9 / (maxDim || 1);
      model.scale.setScalar(scale);

      box.setFromObject(model);
      box.getCenter(center);
      model.position.sub(center);
      model.position.set(
        Math.cos(ufoOrbitAngle) * ORBIT_CONFIG.ufoRadius,
        1.4,
        Math.sin(ufoOrbitAngle) * ORBIT_CONFIG.ufoRadius
      );
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixers.ufo = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => mixers.ufo.clipAction(clip).play());
      }
      checkFinished();
    }, undefined, (err) => {
      console.error('Erro ao carregar nave_espacial_ufo.glb:', err);
      checkFinished();
    });
  }

  function update(delta, speedMultiplier, isPilotMode) {
    // 1. Blackhole Animation
    if (mixers.blackhole) mixers.blackhole.update(delta * speedMultiplier);

    // 2. Earth Orbit & Rotation
    if (models.earth) {
      if (mixers.earth) mixers.earth.update(delta * speedMultiplier);
      earthOrbitAngle += delta * 0.18 * speedMultiplier;
      models.earth.position.x = Math.cos(earthOrbitAngle) * ORBIT_CONFIG.earthRadius;
      models.earth.position.z = Math.sin(earthOrbitAngle) * ORBIT_CONFIG.earthRadius;
      models.earth.position.y = Math.sin(earthOrbitAngle * 2) * 0.4;
      models.earth.rotation.y += delta * 0.2 * speedMultiplier;
    }

    // 3. Space Ship UB-65 Orbit
    if (models.ship) {
      if (mixers.ship) mixers.ship.update(delta * speedMultiplier);
      shipOrbitAngle += delta * 0.22 * speedMultiplier;
      models.ship.position.x = Math.cos(shipOrbitAngle) * ORBIT_CONFIG.shipRadius;
      models.ship.position.z = Math.sin(shipOrbitAngle) * ORBIT_CONFIG.shipRadius;
      models.ship.position.y = 0.8 + Math.sin(shipOrbitAngle * 3) * 0.3;

      const tangentX = -Math.sin(shipOrbitAngle);
      const tangentZ = Math.cos(shipOrbitAngle);
      models.ship.rotation.y = Math.atan2(tangentX, tangentZ);
      models.ship.rotation.z = Math.sin(shipOrbitAngle * 4) * 0.15;
    }

    // 4. Satellite orbiting Earth
    if (models.satellite) {
      if (mixers.satellite) mixers.satellite.update(delta * speedMultiplier);
      if (models.earth) {
        satelliteLocalAngle += delta * 0.7 * speedMultiplier;
        const satX = models.earth.position.x + Math.cos(satelliteLocalAngle) * ORBIT_CONFIG.satelliteEarthRadius;
        const satZ = models.earth.position.z + Math.sin(satelliteLocalAngle) * ORBIT_CONFIG.satelliteEarthRadius;
        const satY = models.earth.position.y + Math.sin(satelliteLocalAngle * 2) * 0.8;
        models.satellite.position.set(satX, satY, satZ);
        models.satellite.lookAt(models.earth.position);
      }
    }

    // 5. UFO Auto Patrol (if not in WASD Pilot Mode)
    if (models.ufo) {
      if (mixers.ufo) mixers.ufo.update(delta * speedMultiplier);
      if (!isPilotMode) {
        ufoOrbitAngle += delta * 0.28 * speedMultiplier;
        models.ufo.position.x = Math.cos(ufoOrbitAngle) * ORBIT_CONFIG.ufoRadius;
        models.ufo.position.z = Math.sin(ufoOrbitAngle) * ORBIT_CONFIG.ufoRadius;
        models.ufo.position.y = 1.4 + Math.sin(ufoOrbitAngle * 2) * 0.5;
        models.ufo.rotation.y += delta * 0.8 * speedMultiplier;
      }
    }
  }

  return {
    models,
    mixers,
    loadAll,
    update
  };
}
