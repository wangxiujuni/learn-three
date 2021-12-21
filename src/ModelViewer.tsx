import React, { Component, createRef, RefObject } from "react";
import {
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  TextureLoader,
  WebGLRenderer,
} from "three";
import bg from "./models/environment/bg.jpeg";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import stacyModel from "./models/stacy/stacy_lightweight.glb?url";
import stacyTexture from "./models/stacy/stacy.jpg";
import { centerModel } from "./utils";

type Disposable<T extends Record<string, { dispose: any }>> = T;
type ModelViewerProps = {};
type ModelViewerState = {};
type DisposableObjects = Partial<
  Disposable<{
    renderer: WebGLRenderer;
    orbitControls: OrbitControls;
  }>
>;
type OtherObj = Partial<{
  rootScene: Scene;
  gridHelper: GridHelper;
  camera: PerspectiveCamera;
  stats: Stats;
}>;

class ModelViewer extends Component<ModelViewerProps, ModelViewerState> {
  disObjs: DisposableObjects;
  otherObjs: OtherObj;
  containerRef: RefObject<HTMLDivElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  stopAnimation: boolean;
  canvasResizeObs?: ResizeObserver;
  constructor(props: Readonly<ModelViewerProps>) {
    super(props);
    this.containerRef = createRef();
    this.canvasRef = createRef();
    this.disObjs = {};
    this.otherObjs = {};
    this.stopAnimation = false;
  }

  componentDidMount() {
    this.initRenderer();
    this.initRootScene();
    this.initCamera();
    this.initStats();
    this.initResizeHandler();
    this.startAnimation();
  }

  componentWillUnmount() {
    this.destroy();
  }

  initRenderer() {
    const canvas = this.canvasRef.current!;
    const renderer = new WebGLRenderer({
      canvas,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xeeeeee);
    // renderer.shadowMap.enabled = true;
    // renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;

    this.disObjs.renderer = renderer;
  }
  loadModel(): Promise<GLTF> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        stacyModel,
        resolve,
        ({ total, loaded }) => {
          console.log(loaded / total);
        },
        reject
      );
    });
  }
  initRootScene() {
    const scene = new Scene();
    const gridHelper = new GridHelper();
    this.otherObjs.rootScene = scene;
    this.otherObjs.gridHelper = gridHelper;

    scene.background = new TextureLoader().load(bg);

    this.initStacyMesh();

    scene.add(gridHelper);
  }
  async initStacyMesh() {
    const { rootScene } = this.otherObjs;
    const texture = new TextureLoader().load(stacyTexture);
    texture.flipY = false;
    const material = new MeshBasicMaterial({
      map: texture,
    });
    const model = await this.loadModel();
    model.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = material;
      }
    });

    centerModel(model.scene);
    rootScene!.add(model.scene);
  }
  initCamera() {
    const { clientWidth, clientHeight } = this.canvasRef.current!;
    const { renderer } = this.disObjs;
    const camera = new PerspectiveCamera(
      75,
      clientWidth / clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);

    const controls = new OrbitControls(camera, renderer!.domElement);
    // controls.enablePan = false;

    this.disObjs.orbitControls = controls;
    this.otherObjs.camera = camera;
  }
  initStats() {
    const stats = Stats();
    stats.dom.style.position = "absolute";
    this.containerRef.current!.appendChild(stats.dom);
    this.otherObjs.stats = stats;
  }
  initResizeHandler() {
    const { renderer } = this.disObjs;
    const { camera } = this.otherObjs;
    const canvas = this.canvasRef.current!;
    this.canvasResizeObs = new ResizeObserver(([{ contentRect }]) => {
      const { width, height } = contentRect;
      console.log(width, height);
      renderer!.setSize(width, height, false);
      camera!.aspect = width / height;
      camera!.updateProjectionMatrix();
    });
    this.canvasResizeObs.observe(canvas);
  }
  startAnimation = () => {
    if (!this.stopAnimation) {
      const { renderer, orbitControls } = this
        .disObjs as Required<DisposableObjects>;
      const { camera, rootScene, stats } = this.otherObjs as Required<OtherObj>;
      requestAnimationFrame(this.startAnimation);
      renderer.render(rootScene, camera);
      orbitControls.update();
      stats.update();
    }
  };
  destroy() {
    this.stopAnimation = true;
    // 停止监听 canvas resize
    this.canvasResizeObs?.disconnect();
    // 销毁 three 对象
    Object.entries(this.disObjs).forEach(([, obj]) => {
      obj.dispose();
    });
  }

  render() {
    return (
      <div style={{ position: "relative" }} ref={this.containerRef}>
        <canvas
          ref={this.canvasRef}
          style={{
            width: "100%",
            height: 720,
          }}
        />
      </div>
    );
  }
}

export default ModelViewer;
