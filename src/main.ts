import * as OBC from "openbim-components";
import * as THREE from "three";

const viewer = new OBC.Components();

// Scene
const sceneComponent = new OBC.SimpleScene(viewer);
viewer.scene = sceneComponent;
const scene = sceneComponent.get();
const ambientLight = new THREE.AmbientLight(0xe6e7e4, 1);
const directionalLight = new THREE.DirectionalLight(0xf9f9f9, 0.75);
directionalLight.position.set(10, 50, 10);
scene.add(ambientLight, directionalLight);
scene.background = new THREE.Color("#202932");

const viewerContainer = document.getElementById("app") as HTMLDivElement;
const rendererComponent = new OBC.PostproductionRenderer(
  viewer,
  viewerContainer
);
viewer.renderer = rendererComponent;

// Camera
const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
viewer.camera = cameraComponent;

const raycasterComponent = new OBC.SimpleRaycaster(viewer);
viewer.raycaster = raycasterComponent;

viewer.init();
rendererComponent.postproduction.enabled = true;

// Grid
new OBC.SimpleGrid(viewer, new THREE.Color("#ccc"));

// Load IFC

const ifcLoader = new OBC.FragmentIfcLoader(viewer);

const highlighter = new OBC.FragmentHighlighter(viewer);
highlighter.setup();

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);

ifcLoader.onIfcLoaded.add(async (model) => {
  propertiesProcessor.process(model);
  await highlighter.update();
  highlighter.events.select.onHighlight.add((selection) => {
    const fragmentID = Object.keys(selection)[0];
    const expressID = Number([...selection[fragmentID]][0]);
    propertiesProcessor.renderProperties(model, expressID);
  });
});

// Create toolbar
const mainToolbar = new OBC.Toolbar(viewer);
mainToolbar.addChild(ifcLoader.uiElement.get("main"),
  propertiesProcessor.uiElement.get('main')
);
viewer.ui.addToolbar(mainToolbar);
