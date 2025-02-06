let sphereR = 150;
let diskSize = 350;
const sampleSize = 5;
let rays = [];
let asciiRamp;
let stepX, stepY;

function setup() {
  let container = document.querySelector('.simulation-container');
  let canvas = createCanvas(container.offsetWidth, container.offsetHeight, WEBGL);
  canvas.parent('simulation-canvas');
  
  asciiRamp = " .:-=+*#%@".split('');
  calculateStepSizes();
  
  updateRays(int(document.getElementById('numRaysSlider').value));
  noStroke();
  
  let resetBtn = document.getElementById('resetRaysBtn');
  resetBtn.addEventListener('click', () => {
    updateRays(int(document.getElementById('numRaysSlider').value));
  });
}

function calculateStepSizes() {
  const targetRows = 100;
  const aspectRatio = width / height;
  stepY = height / targetRows;
  stepX = stepY * 0.5;
}

function updateRays(desiredNum) {
  rays = Array(desiredNum).fill().map(() => ({
    theta: random(TWO_PI),
    phi: random(PI),
    baseLength: random(50, 100)
  }));
}

function drawRays() {
  drawingContext.disable(drawingContext.DEPTH_TEST);
  stroke(128, 128, 128);
  strokeWeight(8);
  
  const frameOffset = frameCount * 0.05;
  rays.forEach((ray, i) => {
    const lengthOffset = sin(frameOffset + i) * 20;
    const currentLength = ray.baseLength + lengthOffset;
    
    const sinPhi = sin(ray.phi);
    const cosPhi = cos(ray.phi);
    const sinTheta = sin(ray.theta);
    const cosTheta = cos(ray.theta);
    
    const x = sphereR * sinPhi * cosTheta;
    const y = sphereR * sinPhi * sinTheta;
    const z = sphereR * cosPhi;
    
    const ex = x + currentLength * sinPhi * cosTheta;
    const ey = y + currentLength * sinPhi * sinTheta;
    const ez = z + currentLength * cosPhi;
    
    line(x, y, z, ex, ey, ez);
  });
  drawingContext.enable(drawingContext.DEPTH_TEST);
}

function generateVersionNumber() {
  const minor = nf(floor(random(100)), 2);
  const patch = nf(floor(random(100)), 2);
  return `V5.${minor}.${patch}`;
}

function convertToAscii() {
  loadPixels();
  let asciiStr = "";
  
  for (let y = 0; y < height; y += stepY) {
    let row = "";
    const yOffset = floor(y) * width;
    
    for (let x = 0; x < width; x += stepX) {
      const idx = 4 * (floor(x) + yOffset);
      const bright = (0.2126 * pixels[idx] + 0.7152 * pixels[idx + 1] + 0.0722 * pixels[idx + 2]) / 255;
      row += asciiRamp[floor(bright * (asciiRamp.length - 1))];
    }
    asciiStr += row + "\n";
  }
  
  return asciiStr;
}

function draw() {
  sphereR = int(document.getElementById('sphereRadiusSlider').value);
  diskSize = int(document.getElementById('diskSizeSlider').value);
  const desiredRays = int(document.getElementById('numRaysSlider').value);
  
  if (desiredRays !== rays.length) {
    updateRays(desiredRays);
  }

  background(0);
  
  ambientLight(50);
  directionalLight(255, 255, 255, 0, 0, -1);
  orbitControl();
  
  ambientMaterial(150, 150, 255);
  sphere(sphereR);
  
  push();
  rotateX(HALF_PI);
  fill(20);
  noStroke();
  ellipse(0, 0, diskSize, diskSize);
  pop();
  
  drawRays();

  document.getElementById('version').innerHTML = generateVersionNumber();
  document.getElementById('ascii-output').innerHTML = convertToAscii();
}

function windowResized() {
  let container = document.querySelector('.simulation-container');
  resizeCanvas(container.offsetWidth, container.offsetHeight);
  calculateStepSizes();
}