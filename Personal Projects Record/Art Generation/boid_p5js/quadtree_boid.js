class quadtree{
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.boids = [];
        this.divided = false;
    }

    divide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let w = this.boundary.w;
        let h = this.boundary.h;
        let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
        this.northeast = new quadtree(ne, this.capacity);
        let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
        this.northwest = new quadtree(nw, this.capacity);
        let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
        this.southeast = new quadtree(se, this.capacity);
        let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);
        this.southwest = new quadtree(sw, this.capacity);
        this.divided = true;
    }

    add(boid) {
        let point = boid.position;
        let passpoint = new Point(point.x, point.y);
        if (!this.boundary.contains(passpoint)) return false;
        if (this.boids.length < this.capacity){ this.boids.push(boid); return true;}
        else if (!this.divided) this.divide();
        if (this.northeast.add(boid)) {
            return true;
        } else if (this.northwest.add(boid)) {
            return true;
        } else if (this.southeast.add(boid)) {
            return true;
        } else if (this.southwest.add(boid)) {
            return true;
        }
    }

    check(range, found) {
        if (!found) found = [];
        if (!this.boundary.intersects(range)) {
            return;
        }
        for (let p of this.boids) {
            let point = new Point(p.position.x, p.position.y);
            if (range.contains(point)) {
                found.push(p);
            }
        }

        if (this.divided) {
            this.northeast.check(range, found);
            this.northwest.check(range, found);
            this.southeast.check(range, found);
            this.southwest.check(range, found);
        }
        return found
    }
}

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
