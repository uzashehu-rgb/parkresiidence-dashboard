import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { type Apartment, apartments as ALL_APARTMENTS } from "@/data/apartments";

const FLOORS = 8;
const COLS = 4;

// Building dimensions
const UNIT_W = 1.4;
const UNIT_H = 1.0;
const GROUND_H = 1.2;
const PARAPET_H = 0.25;
const FACADE_DEPTH = 0.08;
const BALCONY_DEPTH = 0.55;
const BUILDING_W = COLS * UNIT_W;
const BUILDING_H = GROUND_H + FLOORS * UNIT_H + PARAPET_H;
const BUILDING_D = 2.6;

// Materials colors
const RENDER_WHITE = "#EFEAE0";
const RENDER_SHADOW = "#D8D2C5";
const FRAME_DARK = "#2A2826";
const GLASS_TINT = "#3E4A52";

const STATUS_COLORS: Record<Apartment["status"], string> = {
  available: "#C9A86A", // brass
  reserved: "#7A8C7E",
  sold: "#1F1F1F",
};

// === Glass pane that lights up by status ===
function StatusGlass({
  apartment,
  position,
  width,
  height,
  isHovered,
  isVisible,
  setHoveredId,
  onSelect,
}: {
  apartment: Apartment;
  position: [number, number, number];
  width: number;
  height: number;
  isHovered: boolean;
  isVisible: boolean;
  setHoveredId: (id: string | null) => void;
  onSelect: (a: Apartment) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = STATUS_COLORS[apartment.status];

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const pulse =
      apartment.status === "available"
        ? 0.5 + Math.sin(state.clock.elapsedTime * 1.2 + apartment.floor + apartment.col) * 0.15
        : apartment.status === "reserved"
          ? 0.18
          : 0.04;
    const hoverBoost = isHovered ? 0.7 : 0;
    const target = (pulse + hoverBoost) * (isVisible ? 1 : 0.1);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, 0.12);
    mat.opacity = THREE.MathUtils.lerp(
      mat.opacity,
      isVisible ? 0.95 : 0.25,
      0.12,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
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
        onSelect(apartment);
      }}
    >
      <boxGeometry args={[width, height, 0.04]} />
      <meshStandardMaterial
        color={apartment.status === "sold" ? GLASS_TINT : baseColor}
        emissive={baseColor}
        emissiveIntensity={0.2}
        roughness={0.15}
        metalness={0.3}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

// === A single apartment unit on the facade with window, frame, and balcony ===
function ApartmentUnit({
  apartment,
  position,
  isHovered,
  isVisible,
  setHoveredId,
  onSelect,
}: {
  apartment: Apartment;
  position: [number, number, number];
  isHovered: boolean;
  isVisible: boolean;
  setHoveredId: (id: string | null) => void;
  onSelect: (a: Apartment) => void;
}) {
  const winW = UNIT_W * 0.78;
  const winH = UNIT_H * 0.7;
  const frameThickness = 0.04;
  const sillH = 0.06;

  return (
    <group position={position}>
      {/* Window recess (dark inset behind glass) */}
      <mesh position={[0, 0, FACADE_DEPTH / 2 - 0.01]}>
        <boxGeometry args={[winW + 0.04, winH + 0.04, 0.02]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.6} />
      </mesh>

      {/* Glass pane (status light) */}
      <StatusGlass
        apartment={apartment}
        position={[0, 0, FACADE_DEPTH / 2 + 0.02]}
        width={winW}
        height={winH}
        isHovered={isHovered}
        isVisible={isVisible}
        setHoveredId={setHoveredId}
        onSelect={onSelect}
      />

      {/* Window mullions (cross frame) */}
      <mesh position={[0, 0, FACADE_DEPTH / 2 + 0.045]}>
        <boxGeometry args={[winW, frameThickness, 0.015]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, FACADE_DEPTH / 2 + 0.045]}>
        <boxGeometry args={[frameThickness, winH, 0.015]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.4} />
      </mesh>

      {/* Window frame border */}
      {[
        [0, winH / 2 + frameThickness, winW + frameThickness * 2, frameThickness * 2],
        [0, -winH / 2 - frameThickness, winW + frameThickness * 2, frameThickness * 2],
        [winW / 2 + frameThickness, 0, frameThickness * 2, winH],
        [-winW / 2 - frameThickness, 0, frameThickness * 2, winH],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, FACADE_DEPTH / 2 + 0.04]}>
          <boxGeometry args={[w, h, 0.025]} />
          <meshStandardMaterial color={FRAME_DARK} roughness={0.45} />
        </mesh>
      ))}

      {/* Sill */}
      <mesh position={[0, -winH / 2 - frameThickness - sillH / 2, FACADE_DEPTH / 2 + 0.04]}>
        <boxGeometry args={[winW + 0.18, sillH, 0.06]} />
        <meshStandardMaterial color="#E8E2D5" roughness={0.7} />
      </mesh>

      {/* Balcony slab + glass railing (only on upper floors) */}
      {apartment.floor > 1 && (
        <group position={[0, -UNIT_H / 2 + 0.02, FACADE_DEPTH / 2 + BALCONY_DEPTH / 2]}>
          {/* Slab */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[UNIT_W * 0.95, 0.06, BALCONY_DEPTH]} />
            <meshStandardMaterial color="#EAE3D2" roughness={0.85} />
          </mesh>
          {/* Glass railing front */}
          <mesh position={[0, 0.32, BALCONY_DEPTH / 2 - 0.01]}>
            <boxGeometry args={[UNIT_W * 0.95, 0.6, 0.015]} />
            <meshStandardMaterial
              color="#A8B5BC"
              transparent
              opacity={0.35}
              roughness={0.05}
              metalness={0.2}
            />
          </mesh>
          {/* Glass railing sides */}
          <mesh position={[UNIT_W * 0.475 - 0.01, 0.32, 0]}>
            <boxGeometry args={[0.015, 0.6, BALCONY_DEPTH]} />
            <meshStandardMaterial
              color="#A8B5BC"
              transparent
              opacity={0.3}
              roughness={0.05}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[-UNIT_W * 0.475 + 0.01, 0.32, 0]}>
            <boxGeometry args={[0.015, 0.6, BALCONY_DEPTH]} />
            <meshStandardMaterial
              color="#A8B5BC"
              transparent
              opacity={0.3}
              roughness={0.05}
              metalness={0.2}
            />
          </mesh>
          {/* Brass top rail */}
          <mesh position={[0, 0.62, BALCONY_DEPTH / 2 - 0.01]}>
            <boxGeometry args={[UNIT_W * 0.95, 0.025, 0.04]} />
            <meshStandardMaterial color="#B3996F" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// === Facade structure ===
function Building({
  building,
  visibleIds,
  hoveredId,
  setHoveredId,
  onSelect,
  position,
}: {
  building: string;
  visibleIds: Set<string>;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (a: Apartment) => void;
  position: [number, number, number];
}) {
  const units = ALL_APARTMENTS.filter((a) => a.building === building);

  // Floor slabs (horizontal bands)
  const floorBands = Array.from({ length: FLOORS + 1 }).map((_, i) => {
    const y = GROUND_H + i * UNIT_H;
    return (
      <mesh key={`slab-${i}`} position={[0, y, BUILDING_D / 2 + 0.02]} castShadow>
        <boxGeometry args={[BUILDING_W + 0.16, 0.08, 0.16]} />
        <meshStandardMaterial color="#E2DCCD" roughness={0.7} />
      </mesh>
    );
  });

  // Vertical pilasters between units
  const pilasters = Array.from({ length: COLS + 1 }).map((_, i) => {
    const x = (i - COLS / 2) * UNIT_W;
    return (
      <mesh
        key={`pil-${i}`}
        position={[x, GROUND_H + (FLOORS * UNIT_H) / 2, BUILDING_D / 2 + 0.04]}
        castShadow
      >
        <boxGeometry args={[0.12, FLOORS * UNIT_H, 0.12]} />
        <meshStandardMaterial color={RENDER_SHADOW} roughness={0.85} />
      </mesh>
    );
  });

  return (
    <group position={position}>
      {/* === Main building mass === */}
      <mesh position={[0, BUILDING_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BUILDING_W, BUILDING_H, BUILDING_D]} />
        <meshStandardMaterial color={RENDER_WHITE} roughness={0.85} metalness={0.02} />
      </mesh>

      {/* === Ground floor — taller, glass entrance === */}
      <mesh position={[0, GROUND_H / 2, BUILDING_D / 2 + 0.005]}>
        <boxGeometry args={[BUILDING_W * 0.95, GROUND_H * 0.85, 0.015]} />
        <meshStandardMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.4}
          emissive="#5A6B72"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Ground floor mullions */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * (BUILDING_W * 0.95 / 4);
        return (
          <mesh key={`gm-${i}`} position={[x, GROUND_H / 2, BUILDING_D / 2 + 0.012]}>
            <boxGeometry args={[0.04, GROUND_H * 0.85, 0.025]} />
            <meshStandardMaterial color={FRAME_DARK} roughness={0.4} />
          </mesh>
        );
      })}
      {/* Entrance canopy */}
      <mesh position={[0, GROUND_H + 0.02, BUILDING_D / 2 + 0.4]} castShadow>
        <boxGeometry args={[BUILDING_W * 0.4, 0.04, 0.8]} />
        <meshStandardMaterial color="#3A3A38" roughness={0.5} />
      </mesh>

      {/* === Floor slabs and pilasters === */}
      {floorBands}
      {pilasters}

      {/* === Roof parapet === */}
      <mesh position={[0, BUILDING_H + PARAPET_H / 2, 0]} castShadow>
        <boxGeometry args={[BUILDING_W + 0.2, PARAPET_H, BUILDING_D + 0.2]} />
        <meshStandardMaterial color="#D8D2C5" roughness={0.8} />
      </mesh>
      {/* Roof cap shadow line */}
      <mesh position={[0, BUILDING_H + PARAPET_H + 0.005, 0]}>
        <boxGeometry args={[BUILDING_W + 0.28, 0.02, BUILDING_D + 0.28]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.5} />
      </mesh>

      {/* === Apartment units (front facade) === */}
      {units.map((u) => {
        const x = (u.col - (COLS - 1) / 2) * UNIT_W;
        const y = GROUND_H + (u.floor - 1) * UNIT_H + UNIT_H / 2;
        const z = BUILDING_D / 2 + 0.05;
        return (
          <ApartmentUnit
            key={u.id}
            apartment={u}
            position={[x, y, z]}
            isHovered={hoveredId === u.id}
            isVisible={visibleIds.has(u.id)}
            setHoveredId={setHoveredId}
            onSelect={onSelect}
          />
        );
      })}

      {/* === Side facade (suggested windows for realism) === */}
      {Array.from({ length: FLOORS }).map((_, floor) =>
        [-1, 1].map((side) => (
          <mesh
            key={`side-${floor}-${side}`}
            position={[
              side * (BUILDING_W / 2 + 0.005),
              GROUND_H + floor * UNIT_H + UNIT_H / 2,
              0,
            ]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <planeGeometry args={[BUILDING_D * 0.7, UNIT_H * 0.55]} />
            <meshStandardMaterial
              color={GLASS_TINT}
              transparent
              opacity={0.5}
              roughness={0.15}
              metalness={0.3}
              emissive="#3E4A52"
              emissiveIntensity={0.08}
            />
          </mesh>
        )),
      )}

      {/* === Building label letter === */}
      <mesh position={[BUILDING_W / 2 - 0.15, GROUND_H * 0.5, BUILDING_D / 2 + 0.02]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshBasicMaterial color="#B3996F" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// === Landscape ===
function Landscape() {
  return (
    <>
      {/* Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[26, 64]} />
        <meshStandardMaterial color="#9DAE94" roughness={0.95} />
      </mesh>
      {/* Inner garden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 1.5]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#8AA084" roughness={0.95} />
      </mesh>
      {/* Path stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.5]}>
        <ringGeometry args={[3.2, 3.6, 48]} />
        <meshStandardMaterial color="#E8E2D5" roughness={0.9} />
      </mesh>
      {/* Plaza in front */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 5.5]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial color="#DDD7C8" roughness={0.9} />
      </mesh>

      {/* Trees */}
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const r = 14 + (i % 4) * 2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        const scale = 0.85 + ((i * 17) % 5) * 0.1;
        return (
          <group key={i} position={[x, 0, z]} scale={scale}>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.1, 1.2, 8]} />
              <meshStandardMaterial color="#5C4A3A" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <sphereGeometry args={[0.85, 14, 12]} />
              <meshStandardMaterial color="#6F8169" roughness={0.95} />
            </mesh>
            <mesh position={[0.2, 1.55, 0.15]} castShadow>
              <sphereGeometry args={[0.5, 12, 10]} />
              <meshStandardMaterial color="#7A8E73" roughness={0.95} />
            </mesh>
          </group>
        );
      })}

      {/* Hedges between buildings */}
      {[-1, 1].map((side) => (
        <mesh
          key={`hedge-${side}`}
          position={[side * 5.5, 0.3, 4]}
          castShadow
        >
          <boxGeometry args={[0.6, 0.6, 4]} />
          <meshStandardMaterial color="#7A8E73" roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

function Scene({
  visibleIds,
  hoveredId,
  setHoveredId,
  onSelect,
}: {
  visibleIds: Set<string>;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect: (a: Apartment) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 12, 10]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-8, 6, -5]} intensity={0.4} color="#D9C8A8" />
      <hemisphereLight args={["#FFF6E0", "#5C6F5A", 0.4]} />

      <Building
        building="A"
        visibleIds={visibleIds}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onSelect={onSelect}
        position={[-(BUILDING_W / 2 + 1.4), 0, 0]}
      />
      <Building
        building="B"
        visibleIds={visibleIds}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onSelect={onSelect}
        position={[BUILDING_W / 2 + 1.4, 0, 0]}
      />

      <Landscape />
      <ContactShadows
        position={[0, 0.015, 0]}
        opacity={0.5}
        scale={30}
        blur={2.8}
        far={8}
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
        camera={{ position: [0, 7, 22], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={null}>
          <Scene
            visibleIds={visibleIds}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            onSelect={onSelectApartment}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={14}
          maxDistance={32}
          minPolarAngle={Math.PI / 7}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate={!hoveredId}
          autoRotateSpeed={0.35}
          dampingFactor={0.08}
          target={[0, 4, 0]}
        />
      </Canvas>

      {hoveredApt && hoverPos && (
        <UnitTooltip apartment={hoveredApt} x={hoverPos.x} y={hoverPos.y} />
      )}
    </div>
  );
}

function UnitTooltip({ apartment, x, y }: { apartment: Apartment; x: number; y: number }) {
  const formatter = new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  return (
    <div
      className="pointer-events-none fixed z-40 -translate-x-1/2 -translate-y-[calc(100%+18px)] glass-card rounded-xl p-5 w-72"
      style={{ left: x, top: y }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="eyebrow text-brass">Unit {apartment.number}</span>
        <span
          className={`eyebrow ${
            apartment.status === "available"
              ? "text-brass"
              : apartment.status === "reserved"
                ? "text-leaf"
                : "text-graphite/50"
          }`}
        >
          {apartment.status}
        </span>
      </div>
      <h3 className="font-serif text-xl text-graphite leading-tight">{apartment.name}</h3>
      <div className="hairline my-3" />
      <div className="space-y-1.5 text-[11px] text-graphite/70 tabular-nums">
        <div className="flex justify-between">
          <span>Floor</span>
          <span>
            {apartment.floor} of {FLOORS}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Surface</span>
          <span>{apartment.area} m²</span>
        </div>
        <div className="flex justify-between">
          <span>Rooms</span>
          <span>{apartment.rooms}</span>
        </div>
        <div className="flex justify-between">
          <span>Orientation</span>
          <span>{apartment.orientation}</span>
        </div>
        {apartment.status !== "sold" && (
          <div className="flex justify-between pt-2 mt-2 border-t border-graphite/8">
            <span className="text-graphite/60">From</span>
            <span className="text-graphite font-medium">{formatter.format(apartment.price)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
