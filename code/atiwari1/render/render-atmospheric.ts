import * as THREE from 'three';


///
/// AtmosRenderer
///
/// 2017-10-11 aman @atiwari1
///
/// your encapsulation of my typical render setup
///

///
/// In this workshop you will get to create your own customized renderer.
/// You'll be "encapsulating" the stuff you usually use to render the scene,
/// so that you can reuse it and spend your time actually doing fun things.
///
/// Begin by copying the contents of this folder (`workshop-1`)
/// into your named folder in `code/`, and then renaming `your-name-workshop-1.md`
/// to something more appropriate, and then putting it in `_projects` as usual.
///
/// In some places you'll see "mystery comments": `/* ??? */`
///
/// These indicate that you'll have to fill something in or write something.
/// You may have to write a whole bunch of things in one mystery comment,
/// it's not like filling out a form, you'll have to work some things out.
///
///
/// In other places, you might see `null` or `Null` instead of a real value.
///
/// Nothing (in this file, at least) is supposed to have a value of `null`,
/// and nothing is supposed to be named `Null`, so if you see null,
/// that's your cue to replace it with something sensible.
///
///
/// If something is too difficult for you at the moment, that's OK.
/// A working example can be found here: `code/workshop-1/SimpleRenderer.js`.
/// If you're bored to death, take a look at `code/evan-erdos/FancyRenderer.js`.
///
///


///
/// (1) Figure out how to `import` code resources from other files:
///
///     1a. Find the module file in the lib directory and add its
///         relative path to the import statement to load from it.
///
///     1b. Figure out how to import everything from it:
///         there are specific syntaxes for importing things selectively,
///         but in this case you'll want to import everything at once.
///


///
/// (2) Name your `class` and `export` it to other scripts:
///
///     2a. Pick a name for your "thing which renders scenes with atmosphere".
///
///     2b. While there are ways to `export` many things,
///         you just want to `export` this specific class *automatically*.
///
export default class AtmosRenderer {

  private scene;

  constructor({
        path = '../../data/',
    width = window.innerWidth,
    height = window.innerHeight,
    background = 0xFF0000,
    ambient = 0xFFBB00,
    light = 0x0000FF,
    ground = 0x000000,
    webgl = { antialias: true, shadowMapEnabled: true },
    position = { x: 0, y: 0, z: 0 },
    fog = { color: 0x0000FF, near: 1, far: 1e3 },
    cam = undefined,
    update = (t) => { }
      } = {}) {

    cam = cam || { fov: 120, aspect: width / height, near: 0.1, far: 2e4 }
    ///
    /// (4) You should pick a sensible import name instead of `THREE`,
    ///     when you import *en masse*, you need a way to refer to everything.
    ///
    let clock = new THREE.Clock()
    let listener = new THREE.AudioListener()
    ///
    /// (5) The more conceptually mundane boilerplate has been added for you,
    ///     but there are some details that you have to fill in yourself:
    ///
    ///     5a. `Renderer` takes a complex object as it's argument,
    ///         so you should pass such an object to it from.
    ///
    ///     5b. It would be nice to have configurable height and width.
    ///
    ///     5c. You seem to have a lot of customizable colors to supply.
    ///
    let renderer = new THREE.WebGLRenderer(webgl);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(ambient, 0);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;


    ///
    /// (6) The scene setup defines most of the dominant colors you'll see,
    ///     especially if your scene is sparse, so choose your colors wisely.
    ///
    let scene = new THREE.Scene();
    this.scene = scene;

    ///
    /// 6a. The fog constructor takes 3 arguments:
    ///     a color for the fog, and near and far distances for fading.
    ///
    scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);
    scene.background = new THREE.Color(background);


    ///
    /// 6b. Anything that has an impact on rendering (lights, meshes, etc)
    ///     you need to add it to the scene for it to be updated and rendered.
    ///
    scene.add(new THREE.AmbientLight(ambient)); //@ts-ignore


    ///
    /// (7) The `camera` represents the viewport to be rendered,
    ///     but it needs to be provided some values first:
    ///     `fov`, `aspect`, `near`, and `far` clipping planes.
    ///     While these don't usually need to change,
    ///     it's good to have them in the argument just in case.
    ///
    let camera = new THREE.PerspectiveCamera(cam.fov, cam.aspect, cam.near, cam.far);


    ///
    /// 7a. The position of the camera is very important,
    ///     so being able to set it from the outside is beneficial.
    ///
    camera.position.set(position.x, position.y, position.z);


    ///
    /// 7b. Be sure to add the camera to the scene!
    ///
    scene.add(camera);


    ///
    /// 7c. The `OrbitControls` are not included with THREE.js by default,
    ///     but they are included in the library module so you can use them.
    ///
    let controls = new THREE.OrbitControls(camera, renderer.domElement);


    ///
    /// (8) Whereas the ambient light will give a flat look,
    ///     using a HemisphereLight will result in a tasteful gradient,
    ///     based on two colors and an intensity value.
    ///
    let sun = new THREE.HemisphereLight(ambient, ground, 1.0);
    sun.position.set(1, 2, 0);
    scene.add(sun);


    ///
    /// (9) This is where things are going to get difficult:
    ///
    ///     9a. We need to be able to `add` things to our `scene`,
    ///         and we need to be able to do so from outside the script.
    ///
    ///     9b. This could be done in the scope of the main `class`, i.e.,
    ///         outside the `constructor`, but to keep the `scene` "private",
    ///         we can define the function in here and assign it to `this`.
    ///
    ///     9c. To access the `scene` from an aforementioned instance method,
    ///         you would need to add it to prototype via `this.scene = whatever`.
    ///         There are very good reasons to add important things like that,
    ///         but there are also some very good reasons not to add it.
    ///         If I try to do something awful like assigning `scene` to `null`,
    ///         like this: `new YourRenderer().scene = null`.
    ///         We should do what we can to prevent silly things like that.
    ///         If the `scene` is never exposed to the outside world,
    ///         we can ensure that nobody will erroneously assign to it.
    ///
    ///     9d. It would also be great to be able to add many objects at once.
    ///         Use the Spread operator (`...`) to allow this function to take
    ///         any number of arguments, or a whole array of objects.
    ///


    ///
    /// (10) This will be a pretty ordinary render loop, but with a crucial difference:
    ///
    ///     10a. We could write this elsewhere, but if we keep it in here,
    ///          we don't have to expose the renderer, scene, etc.
    ///
    ///     10b. We usually want to have some things happen before we render,
    ///          so we can formalize and customize the interaction with lambdas.
    ///
    const render = () => {


      ///
      /// 10c. First, set up the render function with `requestAnimationFrame`.
      ///      (amazingly, this has been done for you!)
      ///
      requestAnimationFrame(render.bind(this));



      ///
      ///     10d. Update your camera controller, it has a method called `update`.
      ///
      controls.update();


      ///
      ///     10e. You should put a function in the constructor and call it here,
      ///          so that you can update external objects you create easily.
      ///          The benefit is that you can not only create objects in your script,
      ///          you can keep the update function in the same scope as the objects,
      ///          even though they have to be passed through here.
      ///          This is a bit complicated. If you get stuck, look at the example.
      ///
      update(clock.getDelta());


      ///     10f. At the end of the function, your should have the renderer `render`.
      ///          (what fortuitous luck you're having, this too is already done!)
      ///
      renderer.render(scene, camera);
    }


    ///
    /// (11) you have been spared the mundane task of writing this function!
    ///
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }


    ///
    /// (12) you should have a good idea what's going on here already
    ///
    window.addEventListener('resize', resize, false);


    ///
    /// (13) begin to render once the page loads
    ///
    window.addEventListener('load', () => render(), false);


    ///
    /// (14) tack the renderer on at the end of the page
    ///
    document.body.appendChild(renderer.domElement);

  }

  public add(...args) {
    for (let arg of args) this.scene.add(arg);
  }
}
