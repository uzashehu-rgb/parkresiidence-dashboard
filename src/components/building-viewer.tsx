import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { type Apartment, apartments as ALL_APARTMENTS } from "@/data/apartments";

const STATUS_COLORS: Record<Apartment["status"], string> = {
  available: "#B3996F", // brass
  reserved: "#7A8C7E",  // muted leaf
  sold: "#3A3A3A",      // graphite muted
};

const STATUS_EMISSIVE: Record<Apartment["status"], string> = {
  available: "#D9B97A",
  reserved: "#5C6F61",
  sold: "#1C1C1C",
};

interface UnitMeshProps {
  apartment: Apartment;
  position: [number, number, number];
  scale: [number, number, number];
  onSelect: (a: Apartment, screen: { x: number; y: number }) => void;
  isHovered: boolean;
  setHoveredId: (id: string | null) => void;
  isVisible: boolean;
}

function UnitMesh({
  apartment,
  position,
  scale,
  onSelect,
  isHovered,
  setHoveredId,
  isVisible,
}: UnitMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  const baseColor = STATUS_COLORS[apartment.status];
  const emissive = STATUS_EMISSIVE[apartment.status];

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    const targetEmissive =
      apartment.status === "available"
        ? 0.35 + Math.sin(state.clock.elapsedTime * 1.4 + apartment.floor) * 0.08
        : 0.05;
    const hoverBoost = isHovered ? 0.5 : 0;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      (targetEmissive + hoverBoost) * (isVisible ? 1 : 0.15),
      0.15,
    );
    const targetOpacity = isVisible ? 1 : 0.12;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.15);
  });

  return (
    <mesh
      ref={ref}
      position={position}
      scale={scale}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setHoveredId(apartment.id);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        setHoveredId(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(apartment, { x: e.clientX, y: e.clientY });
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={emissive}
        emissiveIntensity={0.2}
        roughness={0.35}
        metalness={0.1}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

function BuildingShell({
  position,
  width,
  depth,
  height,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
}) {
  return (
    <group position={position}>
      {/* Main mass */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* Roof slab */}
      <mesh position={[0, height + 0.06, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.12, depth + 0.2]} />
        <meshStandardMaterial color="#E8E4DA" roughness={0.6} />
      </mesh>
    </group>
  );
}

function GroundPlane() {
  return (
    <>
      {/* Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#A8B5A0" roughness={0.95} />
      </mesh>
      {/* Pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <ringGeometry args={[5, 5.4, 64]} />
        <meshStandardMaterial color="#E8E2D5" roughness={0.9} />
      </mesh>
      {/* Trees */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r = 9 + (i % 3) * 1.5;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
              <meshStandardMaterial color="#5C4A3A" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
              <sphereGeometry args={[0.55, 12, 10]} />
              <meshStandardMaterial color="#6F8169" roughness={0.95} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

interface BuildingProps {
  apartments: Apartment[];
  visibleIds: Set<string>;
  onSelect: (a: Apartment, screen: { x: number; y: number }) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}

function BuildingGroup({
  apartments,
  visibleIds,
  onSelect,
  hoveredId,
  setHoveredId,
  xOffset,
  building,
}: BuildingProps & { xOffset: number; building: string }) {
  const units = apartments.filter((a) => a.building === building);
  const FLOORS = 8;
  const COLS = 4;
  const unitW = 0.95;
  const unitH = 0.7;
  const unitD = 0.95;
  const gap = 0.04;

  const buildingW = COLS * unitW + (COLS - 1) * gap;
  const buildingH = FLOORS * unitH + (FLOORS - 1) * gap + 0.4;
  const buildingD = unitD + 0.6;

  return (
    <group position={[xOffset, 0, 0]}>
      <BuildingShell
        position={[0, 0, -0.3]}
        width={buildingW + 0.4}
        depth={buildingD}
        height={buildingH}
      />
      {/* Units (front facade) */}
      {units.map((u) => {
        const x = (u.col - (COLS - 1) / 2) * (unitW + gap);
        const y = 0.2 + (u.floor - 1) * (unitH + gap) + unitH / 2;
        const z = unitD / 2 + 0.01;
        return (
          <UnitMesh
            key={u.id}
            apartment={u}
            position={[x, y, z]}
            scale={[unitW * 0.92, unitH * 0.78, 0.06]}
            onSelect={onSelect}
            isHovered={hoveredId === u.id}
            setHoveredId={setHoveredId}
            isVisible={visibleIds.has(u.id)}
          />
        );
      })}
      {/* Building label */}
      <mesh position={[0, -0.05, buildingD / 2 + 0.05]}>
        <planeGeometry args={[0.6, 0.18]} />
        <meshBasicMaterial color="#1C1C1C" />
      </mesh>
    </group>
  );
}

function Scene({
  visibleIds,
  onSelect,
  hoveredId,
  setHoveredId,
}: BuildingProps) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 10, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 6, -4]} intensity={0.35} color="#D9C8A8" />

      <BuildingGroup
        apartments={ALL_APARTMENTS}
        visibleIds={visibleIds}
        onSelect={onSelect}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        xOffset={-3.2}
        building="A"
      />
      <BuildingGroup
        apartments={ALL_APARTMENTS}
        visibleIds={visibleIds}
        onSelect={onSelect}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        xOffset={3.2}
        building="B"
      />

      <GroundPlane />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={20}
        blur={2.4}
        far={6}
      />
      <Environment preset="apartment" />
    </>
  );
}

export interface BuildingViewerProps {
  visibleIds: Set<string>;
  onSelectApartment: (a: Apartment) => void;
}

export function BuildingViewer({ visibleIds, onSelectApartment }: BuildingViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const hoveredApt = useMemo(
    () => (hoveredId ? ALL_APARTMENTS.find((a) => a.id === hoveredId) ?? null : null),
    [hoveredId],
  );

  return (
    <div
      className="relative w-full h-full"
      onPointerMove={(e) => {
        if (hoveredId) setHoverPos({ x: e.clientX, y: e.clientY });
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 4.5, 12], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={null}>
          <Scene
            apartments={ALL_APARTMENTS}
            visibleIds={visibleIds}
            onSelect={(a) => onSelectApartment(a)}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={8}
          maxDistance={18}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate={!hoveredId}
          autoRotateSpeed={0.4}
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Hover floating glass card */}
      {hoveredApt && hoverPos && (
        <UnitTooltip apartment={hoveredApt} x={hoverPos.x} y={hoverPos.y} />
      )}
    </div>
  );
}

function UnitTooltip({ apartment, x, y }: { apartment: Apartment; x: number; y: number }) {
  return (
    <div
      className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-[calc(100%+16px)] glass-card rounded-xl p-5 w-64"
      style={{ left: x, top: y }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="eyebrow text-brass">Unit {apartment.number}</span>
        <span className={`eyebrow ${
          apartment.status === "available" ? "text-brass" :
          apartment.status === "reserved" ? "text-leaf" : "text-graphite/50"
        }`}>{apartment.status}</span>
      </div>
      <h3 className="font-serif text-xl text-graphite leading-tight">{apartment.name}</h3>
      <div className="hairline my-3" />
      <div className="space-y-1.5 text-[11px] text-graphite/70 tabular-nums">
        <div className="flex justify-between"><span>Floor</span><span>{apartment.floor} of 8</span></div>
        <div className="flex justify-between"><span>Surface</span><span>{apartment.area} m²</span></div>
        <div className="flex justify-between"><span>Rooms</span><span>{apartment.rooms}</span></div>
        <div className="flex justify-between"><span>Orientation</span><span>{apartment.orientation}</span></div>
      </div>
    </div>
  );
}
