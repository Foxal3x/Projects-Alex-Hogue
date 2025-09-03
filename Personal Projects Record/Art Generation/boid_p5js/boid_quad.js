

class Boid{
    constructor(x, y, z, s, m=1.0) {
        this.acceleration = createVector(0, 0);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.position = createVector(x, y);
        this.z = z//here need to be changed
        this.size = s;
        this.mass = m;


        this.maxSpeed = 3;
        this.maxForce = 0.05;
        colorMode(RGB);
        this.color = color(random(200, 255), random(100, 255), random(100, 255)); // pastel-vibrant RGB

    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
    }

    applyForce(force,impact) {
        // We could add mass here if we want: A = F / M
        this.acceleration.add(force.copy().div(this.mass).mult(impact));
    }
    

    flock(boids) {
        let separation = this.separate(boids);
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);

        // Arbitrarily weight these forces
        separation.mult(1.5);
        alignment.mult(1.0);
        cohesion.mult(1.0);

        // Add the force vectors to acceleration
        this.applyForce(separation,1);
        this.applyForce(alignment,1);
        this.applyForce(cohesion,1);
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        this.acceleration.mult(0);
    }

    seek(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.normalize();
        desired.mult(this.maxSpeed);

        let steer = p5.Vector.sub(desired, this.velocity);

        steer.limit(this.maxForce);
        return steer;
    }


    render() {
        let theta = this.velocity.heading() + radians(90);  
        // Draw shadow on shadowLayer
        let shadowOffset = p5.Vector.mult(lightDir, this.z * 5);
        let shadowPos = p5.Vector.sub(this.position, shadowOffset);
        shadowLayer.push();
        shadowLayer.translate(shadowPos.x, shadowPos.y);
        shadowLayer.rotate(theta);
        shadowLayer.noStroke();
        shadowLayer.fill(0, 0, 0, 80); // dark translucent shadow
        shadowLayer.beginShape();
        shadowLayer.vertex(0, -this.size * 2);
        shadowLayer.vertex(-this.size, this.size * 2);
        shadowLayer.vertex(this.size, this.size * 2);
        shadowLayer.endShape(CLOSE);
        shadowLayer.pop();


        // Draw boid on boidLayer
        boidLayer.push();
        boidLayer.translate(this.position.x, this.position.y);
        boidLayer.rotate(theta);
        boidLayer.fill(this.color);
        boidLayer.stroke(0);
        boidLayer.beginShape();
        boidLayer.vertex(0, -this.size * 2);
        boidLayer.vertex(-this.size, this.size * 2);
        boidLayer.vertex(this.size, this.size * 2);
        boidLayer.endShape(CLOSE);
        boidLayer.pop();

    }

    borders() {
        if (this.position.x < -this.size) {
        this.position.x = width + this.size;
        }

        if (this.position.y < -this.size) {
        this.position.y = height + this.size;
        }

        if (this.position.x > width + this.size) {
        this.position.x = -this.size;
        }

        if (this.position.y > height + this.size) {
        this.position.y = -this.size;
        }
    }


    separate() {
        let desiredSeparation = 25.0;
        let steer = createVector(0, 0);
        let count = 0;

        let range = new Circle(this.position.x, this.position.y, desiredSeparation);
        let considerBoid = qtree.check(range);

        for (let boid of considerBoid) {
            cnt++;
            //circle(boid.position.x, boid.position.y, desiredSeparation);// erase later after debugging
            let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (this!=boid && distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, boid.position);
                diff.normalize();

                // Scale by distance
                diff.div(distanceToNeighbor);
                steer.add(diff);

                // Keep track of how many
                count++;
            }
        }

        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    align() {
        let neighborDistance = 50;
        let sum = createVector(0, 0);
        let count = 0;
        let range = new Circle(this.position.x, this.position.y, neighborDistance);
        let considerBoid = qtree.check(range);

        for (let boid of considerBoid) {
            cnt++;
            let d = p5.Vector.dist(this.position, boid.position);
            if (d > 0 && d < neighborDistance) {
                sum.add(boid.velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    // Cohesion
    // For the average location (i.e., center) of all nearby boids, calculate steering vector towards that location
    cohesion() {
        let neighborDistance = 50;
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        let range = new Circle(this.position.x, this.position.y, neighborDistance);
        let considerBoid = qtree.check(range);

        for (let boid of considerBoid) {
            cnt++;
            let d = p5.Vector.dist(this.position, boid.position);
            if (d > 0 && d < neighborDistance) {
                sum.add(boid.position); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum); // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    }
} // class Boid