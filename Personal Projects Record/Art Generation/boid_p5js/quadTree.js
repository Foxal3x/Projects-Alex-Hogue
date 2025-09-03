class quadtree{
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
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

    add(point) {
        if (!this.boundary.contains(point)) return false;
        if (this.points.length < this.capacity){ this.points.push(point); return true;}
        else if (!this.divided) this.divide();
        if (this.northeast.add(point)) {
            return true;
        } else if (this.northwest.add(point)) {
            return true;
        } else if (this.southeast.add(point)) {
            return true;
        } else if (this.southwest.add(point)) {
            return true;
        }
    }

    check(range, found) {
        if (!found) found = [];
        if (!this.boundary.intersects(range)) {
            return;
        }
        for (let p of this.points) {
            if (range.contains(p)) {
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

    show() {
        stroke(255);
        noFill();
        strokeWeight(1);
        rectMode(CENTER);
        rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
        for (let p of this.points) {
            strokeWeight(2);
            point(p.x, p.y);
        }

        if (this.divided) {
            this.northeast.show();
            this.northwest.show();
            this.southeast.show();
            this.southwest.show();
        }
    }
}