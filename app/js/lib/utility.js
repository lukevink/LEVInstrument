///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

var PI = Math.PI;
var TAU = 2 * Math.PI;
function abs(t) { return Math.abs(t); }
function atan(t) { return Math.atan(t); }
function atan2(a,b) { return Math.atan2(a,b); }
function cos(t) { return Math.cos(t); }
function floor(t) { return Math.floor(t); }
function lerp(t,a,b) { return a + t * (b - a); }
function max(a,b) { return Math.max(a,b); }
function min(a,b) { return Math.min(a,b); }
function pow(a,b) { return Math.pow(a,b); }
function rnd() { return Math.rnd(); }
function sCurve(t) { return max(0, min(1, t * t * (3 - t - t))); }
function sin(t) { return Math.sin(t); }
function sqrt(t) { return Math.sqrt(t); }
function tan(t) { return Math.tan(t); }

function phongMaterial(ambient, diffuse, shiny, power) {
   return new THREE.MeshPhongMaterial({
      emissive : ambient,
      color    : diffuse,
      specular : shiny,
      shininess: power
   });
}

function node() {
   return new THREE.Mesh();
}

function cube(material) {
   var geometry = new THREE.BoxGeometry(2, 2, 2);
   return new THREE.Mesh(geometry, material);
}

function globe(material, m, n) {
   if (m === undefined) m = 32;
   if (n === undefined) n = floor(m / 2);
   var geometry = new THREE.SphereGeometry(1, m, n);
   return new THREE.Mesh(geometry, material);
}

function cylinder(material, n) {
   if (n === undefined) n = 24;
   var geometry = new THREE.CylinderGeometry(1, 1, 2, n, 1, false);
   return new THREE.Mesh(geometry, material);
}

function cylinderZ(material, n) {
   if (n === undefined) n = 24;
   var myNode = new node();
   var geometry = new THREE.CylinderGeometry(1, 1, 2, n, 1, false);
   var myShape = new THREE.Mesh(geometry, material);
   myShape.rotation.x = Math.PI / 2;
   myNode.add(myShape);
   return myNode;
}

function ambientLight(color) {
   return new THREE.AmbientLight(color);
}

function directionalLight(x, y, z, color) {
   var myLight = new THREE.DirectionalLight(color);
   myLight.position.set(x,y,z).normalize();
   return myLight;
}

window.addEventListener('resize', function() {
   renderer.setSize(width(), height());
   camera.aspect = width() / height();
   camera.updateProjectionMatrix();
});
function width() { return window.innerWidth; }
function height() { return window.innerHeight; }
