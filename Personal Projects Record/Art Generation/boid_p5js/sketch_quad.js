let totalBoid = 100;
let shadowLayer, boidLayer,lightDir;
let tickCounter = 0;
let cnt = 0;

function setup() {
  createCanvas(500, 500);
  lightDir = createVector(1, -1000).normalize();
  flock = new Flock();

  shadowLayer = createGraphics(width, height);
  boidLayer = createGraphics(width, height);

  for (let i = 0; i < totalBoid; i++) {
    let b = new Boid(width / 2, height / 2,2,5,1);
    flock.addBoid(b)
  }
}

function draw() {
  cnt = 0;
  background(240);
  shadowLayer.clear(); // clear previous shadows
  boidLayer.clear();   // clear previous boids

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