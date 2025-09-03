let qtree;

class Flock{
    constructor() {
        this.boids = [];
        //this.boundary = new Rectangle(300, 300, 300, 300);
    }

    run() {
        this.boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
        qtree = new quadtree(this.boundary, 4);
        for (let boid of this.boids) {
            qtree.add(boid); // ← first build the tree
        }
        for (let boid of this.boids) {
            boid.run(this.boids); // ← now it's safe to call neighbor checks
        }
    }


    addBoid(b) {
        this.boids.push(b);
    }

}