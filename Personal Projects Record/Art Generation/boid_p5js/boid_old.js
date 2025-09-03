
class Boid{

    constructor() {
        this.position = createVector(random(width),random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(2.5,4.5))
        this.acceleration = createVector();
        this.maxSpeed = 3.5;
        this.maxForce = 0.1;

        this.size = 4;
        colorMode(HSB);
        this.color = color(random(256), 255, 255);
    }

    align(boids) {

        let percerption = 60;
        let total = 0;
        let steering = createVector();
        for (let other of boids) {
            if (other == this) continue;
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (d < percerption) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);// target - cur = change
            steering.setMag(this.maxSpeed);  
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
            return steering;
        }
        return createVector(0, 0);
    }
    //dist = abs(dist(this.x, this.y, other.x, other.y));

    cohesion(boids) {

        let percerption = 60;
        let total = 0;
        let steering = createVector();
        for (let other of boids) {
            if (other == this) continue;
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (d < percerption) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);// target - cur = change
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);  
            steering.sub(this.velocity); 
            steering.limit(this.maxForce);
            return steering;
        } 
        return createVector(0, 0);
    }

    seperate(boids) {

        let percerption = 60;
        let total = 0;
        let steering = createVector();
        for (let other of boids) {
            if (other == this) continue;
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (d < percerption) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);  
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
            return steering;
        }
        return createVector(0, 0);

    }

    flock(boids) {
        let alignment = this.align(boids);
        let seperation = this.seperate(boids);
        let cohesion = this.cohesion(boids);

        seperation.mult(separationSlider.value());
        cohesion.mult(cohesionSlider.value());
        alignment.mult(alignSlider.value());
 
        let totalSteering = createVector();
        totalSteering.add(alignment);
        totalSteering.add(seperation);
        totalSteering.add(cohesion);

        if (totalSteering.mag() < 0.001) {
            totalSteering = this.velocity.copy().setMag(0.05); // tiny push forward
        }

        this.acceleration.add(totalSteering);

    }

    show() {
        let theta = this.velocity.heading() + radians(90);
        fill(this.color);
        //strokeWeight(2);
        stroke(255);
        push();
        translate(this.position.x, this.position.y);
        beginShape();
        rotate(theta);
        vertex(0,-this.size*2);
        vertex(-this.size,this.size);
        vertex(this.size,this.size);
        endShape(CLOSE);
        pop();

        //point(this.position.x, this.position.y);
    }

    checkbound() {
        if (this.position.x < 0) this.position.x = width;
        if (this.position.y < 0) this.position.y = height;
        if (this.position.x > width) this.position.x = 0;
        if (this.position.y > height) this.position.y = 0;

    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.checkbound();
    }
}