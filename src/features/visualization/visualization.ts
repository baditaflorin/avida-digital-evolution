import type {
  Color,
  InstancedMesh,
  Object3D,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import {
  CELL_COUNT,
  CELL_HEIGHT,
  CELL_STRIDE,
  CELL_WIDTH,
  type SimulationSnapshot,
} from '../simulation/types';

type ThreeModule = typeof import('three');

type RendererLike = WebGLRenderer & {
  init?: () => Promise<void>;
};

export type VisualizationStatus = {
  renderer: string;
  webgpu: 'active' | 'available' | 'unavailable';
};

export class VisualizationEngine {
  private three: ThreeModule | undefined;
  private renderer: RendererLike | undefined;
  private scene: Scene | undefined;
  private camera: OrthographicCamera | undefined;
  private mesh: InstancedMesh | undefined;
  private dummy: Object3D | undefined;
  private color: Color | undefined;
  private frame = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onStatus: (status: VisualizationStatus) => void,
  ) {}

  async init(): Promise<void> {
    const THREE = await import('three');
    this.three = THREE;

    const webgpuAvailable = await probeWebGpu();
    let renderer: RendererLike | undefined;
    let rendererName = 'Three.js WebGL';
    let webgpu: VisualizationStatus['webgpu'] = webgpuAvailable ? 'available' : 'unavailable';

    if (webgpuAvailable) {
      try {
        const webgpuModule = (await import('three/webgpu')) as {
          WebGPURenderer?: new (options: {
            canvas: HTMLCanvasElement;
            antialias: boolean;
          }) => RendererLike;
        };
        if (webgpuModule.WebGPURenderer) {
          renderer = new webgpuModule.WebGPURenderer({ canvas: this.canvas, antialias: true });
          await renderer.init?.();
          rendererName = 'Three.js WebGPU';
          webgpu = 'active';
        }
      } catch {
        renderer = undefined;
      }
    }

    if (!renderer) {
      renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
      }) as RendererLike;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1110');

    const camera = new THREE.OrthographicCamera(-36, 36, 36, -36, -100, 100);
    camera.position.set(34, 42, 46);
    camera.lookAt(0, 0, 0);

    const light = new THREE.DirectionalLight('#fff7da', 2.1);
    light.position.set(20, 40, 30);
    scene.add(light);
    scene.add(new THREE.AmbientLight('#7aa8ff', 0.75));

    const geometry = new THREE.BoxGeometry(0.82, 0.82, 0.32);
    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.58,
      metalness: 0.05,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, CELL_COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.mesh = mesh;
    this.dummy = new THREE.Object3D();
    this.color = new THREE.Color();
    this.onStatus({ renderer: rendererName, webgpu });
    this.resize();
  }

  resize(): void {
    if (!this.renderer || !this.camera) {
      return;
    }
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    const span = 37;
    this.camera.left = -span * aspect;
    this.camera.right = span * aspect;
    this.camera.top = span;
    this.camera.bottom = -span;
    this.camera.updateProjectionMatrix();
  }

  render(snapshot: SimulationSnapshot): void {
    if (
      !this.three ||
      !this.renderer ||
      !this.scene ||
      !this.camera ||
      !this.mesh ||
      !this.dummy ||
      !this.color
    ) {
      return;
    }

    const spin = Math.sin(this.frame * 0.012) * 0.08;
    this.mesh.rotation.z = spin;

    for (let index = 0; index < CELL_COUNT; index += 1) {
      const offset = index * CELL_STRIDE;
      const alive = snapshot.cells[offset] ?? 0;
      const energy = snapshot.cells[offset + 1] ?? 0;
      const merit = snapshot.cells[offset + 2] ?? 0;
      const hueByte = snapshot.cells[offset + 4] ?? 0;
      const x = index % CELL_WIDTH;
      const y = Math.floor(index / CELL_WIDTH);
      const z = alive ? 0.08 + merit * 0.025 : -0.22;
      const scaleZ = alive ? 0.18 + Math.min(merit, 30) / 16 : 0.04;

      this.dummy.position.set(x - CELL_WIDTH / 2, CELL_HEIGHT / 2 - y, z);
      this.dummy.scale.set(1, 1, scaleZ);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(index, this.dummy.matrix);

      if (alive) {
        this.color.setHSL(hueByte / 255, 0.72, 0.34 + Math.min(energy, 180) / 520);
      } else {
        this.color.setRGB(0.025, 0.035, 0.035);
      }
      this.mesh.setColorAt(index, this.color);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
    this.renderer.render(this.scene, this.camera);
    this.frame += 1;
  }

  dispose(): void {
    this.renderer?.dispose();
  }
}

const probeWebGpu = async (): Promise<boolean> => {
  const gpu = navigator.gpu;
  if (!gpu) {
    return false;
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    const device = await adapter.requestDevice();
    const buffer = device.createBuffer({ size: 4, usage: GPUBufferUsage.COPY_DST });
    buffer.destroy();
    device.destroy();
    return true;
  } catch {
    return false;
  }
};
