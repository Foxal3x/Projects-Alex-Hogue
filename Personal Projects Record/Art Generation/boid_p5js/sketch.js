let totalBoid = 300;
let shadowLayer, boidLayer, lightDir;
let cnt = 0;
let tickCounter = 0;

let gleamCycleLength = 120;
let gleamActiveLength = 100;  // 1.5 seconds of gleam activity
let gleamPhase = 0;
let predator;



function setup() {
  createCanvas(1920 , 1080);
  lightDir = createVector(1, -1000).normalize();
  predator = new Predator(width / 2, height / 2);
  flock = new Flock();

  shadowLayer = createGraphics(width, height);
  boidLayer = createGraphics(width, height);

  for (let i = 0; i < totalBoid; i++) {
    let b = new Boid(width / 2, height / 2,2,5,1);
    flock.addBoid(b);
  }

}

function resetGleamCycle() {
    gleamCycleLength = int(random(120, 200));  // 3 to 4 seconds
}
resetGleamCycle();  // initialize once

function updateGleam() {
  let t = frameCount % gleamCycleLength;

  if (t == 0) {
    resetGleamCycle();  // randomly set gleamCycleLength and gleamActiveLength
  }

  if (t < gleamActiveLength) {
    // Normalize to [-1, 1] so cos(PI*x) makes a bell curve centered at 0
    let x = map(t, 0, gleamActiveLength, -1, 1);
    gleamPhase = pow(cos(PI * x * 0.5), 4);  // smoother than linear, narrower bell
  } else {
    gleamPhase = 0;
  }
}



function draw() {
  cnt = 0;
  background(0);
  shadowLayer.clear(); // clear previous shadows
  boidLayer.clear();   // clear previous boids

  updateGleam();
  flock.run(); // draws into the layers

  image(shadowLayer, 0, 0); // draw shadows first
  image(boidLayer, 0, 0);   // draw boids on top

  tickCounter++;
  if (tickCounter % 30 === 0) {
    console.log(`Tick ${tickCounter}: total iterations = ${cnt}`);
  }

}


function mouseDragged() {
  for (let i = 0; i < totalBoid; i++) {
    let boid = flock.boids[i];
    let force = boid.seek(createVector(mouseX, mouseY));
    boid.applyForce(force,1.5);
  }
}








// const flock = [];

// let alignSlider, cohesionSlider, separationSlider;

// function setup() {
//   createCanvas(600, 600);
//   alignSlider = createSlider(0, 5, 1.4, 0.1);
//   cohesionSlider = createSlider(0, 5, 2, 0.1);
//   separationSlider = createSlider(0, 5, 2, 0.1);
//   for (let i = 0; i < 100 ; i++) {
//     flock.push(new Boid());
//   }
// }

// function draw() {
//   background(0);
//   for (let boid of flock) {
//     boid.flock(flock);
//     boid.update();
//     boid.show();
//   }
// }