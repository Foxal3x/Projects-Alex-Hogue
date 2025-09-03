class Flock{
    constructor() {
        this.boids = [];
    }

    run() {
        predator.run(this.boids);
        for (let boid of this.boids) {
            boid.run(this.boids, predator);
        }

    }

    addBoid(b) {
        this.boids.push(b);
    }

}