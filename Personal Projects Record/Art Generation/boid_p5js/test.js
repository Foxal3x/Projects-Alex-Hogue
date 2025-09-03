class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    return (point.x >= this.x - this.w &&
      point.x < this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y < this.y + this.h);
  }

  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h);
  }
}

let qtree;

function setup() {
  createCanvas(400, 400);
  background(255);
  let boundary = new Rectangle(200, 200, 200, 200);
  qtree = new quadtree(boundary, 4);
  for (let i = 0; i < 300; i++) {
    let x = randomGaussian(width / 2, width / 8);
    let y = randomGaussian(height / 2, height / 8);
    let p = new Point(x, y);
    qtree.add(p);
  }
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.rSquared = r * r;
  }

  contains(point) {
    let d = dist(this.x, this.y, point.x, point.y);
    return d <= this.r;
    // or: return (point.x - this.x) ** 2 + (point.y - this.y) ** 2 <= this.rSquared;
  }

  intersects(rect) {
    let xDist = Math.abs(this.x - rect.x);
    let yDist = Math.abs(this.y - rect.y);

    let edges = (xDist - rect.w) ** 2 + (yDist - rect.h) ** 2;

    // no intersection
    if (xDist > this.r + rect.w || yDist > this.r + rect.h) return false;

    // inside the rectangle
    if (xDist <= rect.w || yDist <= rect.h) return true;

    // intersection on the corner
    return edges <= this.rSquared;
  }
}


function draw() {
  background(0);
  qtree.show();

  stroke(0, 255, 0);
  rectMode(CENTER);
  let range = new Circle(mouseX, mouseY, 50);  // radius 50

  
  // This check has been introduced due to a bug discussed in https://github.com/CodingTrain/website/pull/556
  if (mouseX < width && mouseY < height) {
    circle(range.x, range.y, 100);
    let points = qtree.check(range);
    for (let p of points) {
      strokeWeight(4);
      point(p.x, p.y);
    }
  }

}

function mouseDragged() {
  for (let i = 0; i < 2; i++) {
    qtree.add(createVector(mouseX, mouseY));
  }
}