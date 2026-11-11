"use client";

import { useMotionPreference } from "./motion-system";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const nodeData = [
  { name: "Lumina AI", lat: 28, lon: -118, color: "#ff5ca8" },
  { name: "Verdant Energy", lat: 48, lon: -28, color: "#6ff3a2" },
  { name: "Orbit Finance", lat: 8, lon: 18, color: "#45e7ff" },
  { name: "Aether Robotics", lat: -31, lon: 72, color: "#ffbd61" },
  { name: "Helix Health", lat: 34, lon: 128, color: "#a377ff" },
  { name: "Terra Foods", lat: -42, lon: -52, color: "#f3d45f" },
] as const;

function point(lat: number, lon: number, radius = 2.02) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-modelViewPosition.xyz);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vView)), 2.35);
    float colorMix = smoothstep(-0.8, 0.8, vNormal.x + vNormal.y * 0.22);
    vec3 cyan = vec3(0.12, 0.88, 1.0);
    vec3 magenta = vec3(1.0, 0.22, 0.67);
    vec3 color = mix(cyan, magenta, colorMix);
    color = mix(color, vec3(0.62, 0.43, 1.0), max(0.0, vNormal.y) * 0.32);
    gl_FragColor = vec4(color, 0.018 + fresnel * 0.3);
  }
`;

function SpherePoints() {
  const { positions, colors } = useMemo(() => {
    const count = 720;
    const positionData = new Float32Array(count * 3);
    const colorData = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#38dfff"),
      new THREE.Color("#ff4fa5"),
      new THREE.Color("#ffc05d"),
      new THREE.Color("#8e6aff"),
    ];
    for (let i = 0; i < count; i++) {
      const y = 1 - (2 * i) / (count - 1);
      const radius = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      positionData[i * 3] = Math.cos(theta) * radius * 2.035;
      positionData[i * 3 + 1] = y * 2.035;
      positionData[i * 3 + 2] = Math.sin(theta) * radius * 2.035;
      const color = palette[i % palette.length]
        .clone()
        .lerp(palette[(i + 1) % palette.length], (Math.sin(i * 1.73) + 1) / 2);
      colorData[i * 3] = color.r;
      colorData[i * 3 + 1] = color.g;
      colorData[i * 3 + 2] = color.b;
    }
    return { positions: positionData, colors: colorData };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        vertexColors
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function SphereGrid() {
  const palette = ["#35ddff", "#ff58a9", "#9a78ff", "#ffc369"];
  const latitudeLines = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => {
        const lat = -75 + index * 15;
        return Array.from({ length: 121 }, (__, step) =>
          point(lat, -180 + step * 3, 2.015),
        );
      }),
    [],
  );
  const longitudeLines = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const lon = index * 20;
        return Array.from({ length: 73 }, (__, step) =>
          point(-90 + step * 2.5, lon, 2.016),
        );
      }),
    [],
  );
  return (
    <group>
      {latitudeLines.map((points, index) => (
        <Line
          key={`lat-${index}`}
          points={points}
          color={palette[index % palette.length]}
          lineWidth={0.62}
          transparent
          opacity={index === 5 ? 0.52 : 0.36}
        />
      ))}
      {longitudeLines.map((points, index) => (
        <Line
          key={`lon-${index}`}
          points={points}
          color={palette[(index + 1) % palette.length]}
          lineWidth={0.58}
          transparent
          opacity={0.31}
        />
      ))}
    </group>
  );
}

function FlowingBand({
  color,
  phase,
  tilt,
}: {
  color: string;
  phase: number;
  tilt: number;
}) {
  const strands = useMemo(
    () =>
      Array.from({ length: 7 }, (_, strand) => {
        const offset = (strand - 3) * 0.034;
        return Array.from({ length: 141 }, (__, index) => {
          const angle = (index / 140) * Math.PI * 2;
          const latitude =
            Math.sin(angle * 2 + phase) * 0.48 +
            Math.sin(angle * 3 - phase) * 0.08 +
            offset;
          const radius = 1.84;
          const vector = new THREE.Vector3(
            Math.cos(angle) * Math.cos(latitude) * radius,
            Math.sin(latitude) * radius,
            Math.sin(angle) * Math.cos(latitude) * radius,
          );
          return vector.applyEuler(
            new THREE.Euler(tilt, phase * 0.12, tilt * 0.4),
          );
        });
      }),
    [phase, tilt],
  );
  return (
    <group>
      {strands.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={color}
          lineWidth={index === 3 ? 1.35 : 0.58}
          transparent
          opacity={
            index === 3 ? 0.55 : 0.12 + (3 - Math.abs(3 - index)) * 0.025
          }
        />
      ))}
    </group>
  );
}

function InternalBands({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y -= Math.min(delta, 0.05) * 0.034;
    group.current.rotation.z += Math.min(delta, 0.05) * 0.018;
  });
  return (
    <group ref={group}>
      <FlowingBand color="#4ee5ff" phase={0.2} tilt={0.16} />
      <FlowingBand color="#ff5ba8" phase={2.18} tilt={-0.3} />
      <FlowingBand color="#ffc56d" phase={4.2} tilt={0.42} />
    </group>
  );
}

function DataNode({
  name,
  color,
  position,
  reduced,
  index,
}: {
  name: string;
  color: string;
  position: THREE.Vector3;
  reduced: boolean;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse = reduced
      ? 1
      : 1 + Math.sin(clock.elapsedTime * 2.4 + index) * 0.09;
    const scale = hovered ? 1.45 : pulse;
    group.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
  });
  return (
    <group ref={group} position={position}>
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.062, 18, 18]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh scale={1.82}>
        <sphereGeometry args={[0.062, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.26 : 0.11}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={7} position={[0, 0.23, 0]}>
          <div className="globe-tip neon-sphere-tip">
            {name}
            <br />
            <small>Fictional startup signal</small>
          </div>
        </Html>
      )}
    </group>
  );
}

function Flow({
  curve,
  offset,
  color,
  reduced,
}: {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
  color: string;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(offset);
  useFrame((_state, delta) => {
    if (!reduced)
      progress.current = (progress.current + Math.min(delta, 0.05) * 0.1) % 1;
    ref.current?.position.copy(curve.getPoint(progress.current));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.024, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function DataSphere({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () =>
      nodeData.map((node) => ({
        ...node,
        position: point(node.lat, node.lon),
      })),
    [],
  );
  const arcs = useMemo(
    () =>
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 3],
      ].map(([from, to]) => {
        const start = point(nodeData[from].lat, nodeData[from].lon, 2.045);
        const end = point(nodeData[to].lat, nodeData[to].lon, 2.045);
        const midpoint = start
          .clone()
          .add(end)
          .normalize()
          .multiplyScalar(2.75);
        return new THREE.QuadraticBezierCurve3(start, midpoint, end);
      }),
    [],
  );

  useFrame((_state, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += Math.min(delta, 0.05) * 0.06;
    group.current.rotation.x += Math.min(delta, 0.05) * 0.005;
  });

  return (
    <group ref={group} rotation={[0.12, -0.48, -0.08]}>
      <mesh scale={1.006}>
        <sphereGeometry args={[2, 96, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh scale={0.985}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhysicalMaterial
          color="#8278a8"
          transparent
          opacity={0.055}
          roughness={0.12}
          metalness={0.04}
          transmission={0.52}
          thickness={0.92}
          ior={1.28}
          clearcoat={0.7}
          clearcoatRoughness={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={0.93}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#273547"
          transparent
          opacity={0.075}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <SphereGrid />
      <InternalBands reduced={reduced} />
      <SpherePoints />
      {arcs.map((curve, index) => {
        const color = nodeData[index % nodeData.length].color;
        return (
          <group key={index}>
            <Line
              points={curve.getPoints(60)}
              color={color}
              lineWidth={0.85}
              transparent
              opacity={0.5}
            />
            <Flow
              curve={curve}
              offset={index / arcs.length}
              color={color}
              reduced={reduced}
            />
          </group>
        );
      })}
      {nodes.map((node, index) => (
        <DataNode key={node.name} {...node} index={index} reduced={reduced} />
      ))}
    </group>
  );
}

export default function Globe() {
  const [ready, setReady] = useState(false);
  const { paused: reduced } = useMotionPreference();
  useEffect(() => {
    const canvas = document.createElement("canvas");
    setReady(!!(canvas.getContext("webgl2") || canvas.getContext("webgl")));
  }, []);

  return (
    <div
      className="globe-canvas neon-data-sphere"
      role="img"
      aria-label="Interactive iridescent wireframe sphere of fictional startup signals"
    >
      {ready ? (
        <Canvas
          frameloop={reduced ? "demand" : "always"}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6.25], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
        >
          <ambientLight intensity={0.65} />
          <pointLight position={[-4, 3, 4]} intensity={14} color="#38dfff" />
          <pointLight position={[4, 2, 3]} intensity={13} color="#ff4fa5" />
          <pointLight position={[0, -4, 3]} intensity={10} color="#ffc05d" />
          <DataSphere reduced={reduced} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      ) : (
        <div className="globe-fallback">
          <span>◎</span>
          <p>Interactive data sphere</p>
        </div>
      )}
    </div>
  );
}
