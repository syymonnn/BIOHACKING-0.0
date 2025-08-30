"use client";
import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { MeshSurfaceSampler } from "three-stdlib";

// ---------- helpers ----------
const HUE_GOLDEN = 137.508;
const randColor = (i) => new THREE.Color().setHSL(((i * HUE_GOLDEN) % 360) / 360, 0.9, 0.6);

function fitCameraToBox(camera, controls, box, padding = 1.2) {
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const maxSize = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  let dist = (maxSize / 2) / Math.tan(fov / 2);
  dist *= padding;

  camera.position.set(center.x + dist * 0.7, center.y + dist * 0.5, center.z + dist);
  camera.near = dist / 50;
  camera.far = dist * 50;
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

function sampleFromAllMeshes(scene, totalCount) {
  // raccogli tutte le mesh
  const meshes = [];
  scene.traverse((o) => {
    if (o.isMesh && o.geometry) meshes.push(o);
  });
  if (meshes.length === 0) return null;

  // distribuisci in base all'area approssimata (numero di vertici)
  const weights = meshes.map((m) => (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;

  const positions = new Float32Array(totalCount * 3);
  const normals = new Float32Array(totalCount * 3);

  const tmpPos = new THREE.Vector3();
  const tmpNor = new THREE.Vector3();

  let offset = 0;
  for (let mi = 0; mi < meshes.length; mi++) {
    const mesh = meshes[mi];
    // clona geometria e applica la trasformazione globale
    const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    const tempMesh = new THREE.Mesh(geo);
    tempMesh.applyMatrix4(mesh.matrixWorld);

    const want = Math.floor((weights[mi] / sum) * totalCount);
    const sampler = new MeshSurfaceSampler(tempMesh).build();

    for (let i = 0; i < want && offset < totalCount; i++, offset++) {
      sampler.sample(tmpPos, tmpNor);
      positions.set([tmpPos.x, tmpPos.y, tmpPos.z], offset * 3);
      normals.set([tmpNor.x, tmpNor.y, tmpNor.z], offset * 3);
    }
  }

  // se per arrotondamenti non arrivo a totalCount, riempio con l’ultima mesh
  const lastMesh = meshes[meshes.length - 1];
  if (offset < totalCount) {
    const geo = lastMesh.geometry.index ? lastMesh.geometry.toNonIndexed() : lastMesh.geometry.clone();
    const tempMesh = new THREE.Mesh(geo);
    tempMesh.applyMatrix4(lastMesh.matrixWorld);
    const sampler = new MeshSurfaceSampler(tempMesh).build();
    for (; offset < totalCount; offset++) {
      sampler.sample(tmpPos, tmpNor);
      positions.set([tmpPos.x, tmpPos.y, tmpPos.z], offset * 3);
      normals.set([tmpNor.x, tmpNor.y, tmpNor.z], offset * 3);
    }
  }

  // bounding box per autofit
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < totalCount; i++) {
    v.fromArray(positions, i * 3);
    box.expandByPoint(v);
  }

  return { positions, normals, box };
}

// ---------- instanced pyramids ----------
function Pyramids({ modelUrl, count = 6000 }) {
  const { gl, camera } = useThree();
  const controlsRef = useRef();
  const meshRef = useRef();
  const groupRef = useRef();

  // carica glb
  const gltf = useGLTF(modelUrl);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("GLB caricato:", gltf);
    }
  }, [gltf]);

  // calcola punti da TUTTE le mesh (con world matrices)
  const data = useMemo(() => {
    const res = sampleFromAllMeshes(gltf.scene, count);
    if (!res && process.env.NODE_ENV !== "production") {
      console.warn("❗ Nessuna mesh valida trovata nel GLB. Userò fallback procedurale.");
    }
    return res;
  }, [gltf, count]);

  // fallback procedurale: “bolla” di punti
  const fallbackData = useMemo(() => {
    if (data) return null;
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.setFromSphericalCoords(1, Math.acos(2 * Math.random() - 1), Math.random() * Math.PI * 2);
      positions.set([v.x, v.y, v.z], i * 3);
      normals.set([v.x, v.y, v.z], i * 3);
    }
    const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(2,2,2));
    return { positions, normals, box };
  }, [data, count]);

  const source = data || fallbackData;

  // geometria/materiale
  const pyramidGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.02, 0.06, 4, 1);
    g.translate(0, 0.03, 0);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ wireframe: true, vertexColors: true, toneMapped: false }), []);

  // inizializza istanze e colori
  useEffect(() => {
    if (!source || !meshRef.current) return;
    const imesh = meshRef.current;
    const up = new THREE.Vector3(0, 1, 0);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const nor = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      pos.fromArray(source.positions, i * 3);
      nor.fromArray(source.normals, i * 3);
      q.setFromUnitVectors(up, nor.normalize());
      m.makeRotationFromQuaternion(q);
      m.setPosition(pos);
      imesh.setMatrixAt(i, m);
      imesh.setColorAt(i, randColor(i));
    }
    imesh.instanceMatrix.needsUpdate = true;
    if (imesh.instanceColor) imesh.instanceColor.needsUpdate = true;

    // autofit camera
    fitCameraToBox(camera, controlsRef.current, source.box, 1.35);
  }, [source, count, camera]);

  // idle rotation
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.08 * dt;
  });

  if (!source) return null;

  return (
    <>
      <group ref={groupRef}>
        <instancedMesh ref={meshRef} args={[pyramidGeo, mat, count]} />
      </group>
      <OrbitControls ref={controlsRef} enablePan={false} />
    </>
  );
}

export default function BrainScene({ modelUrl = "/models/brain.glb" }) {
  return (
    <Canvas
      gl={{ antialias: true }}
      camera={{ fov: 50, near: 0.01, far: 1000 }}
      onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))}
    >
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.4} />
      <Pyramids modelUrl={modelUrl} />
    </Canvas>
  );
}
