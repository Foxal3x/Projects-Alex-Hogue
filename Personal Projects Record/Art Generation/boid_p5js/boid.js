

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


        this.density = 0;          // how many neighbors nearby
        this.localCenter = createVector(0, 0);
        this.localDensity = 0;
        this.localDistance = 0;
        this.densityTime = random();  // phase offset for smoother group resonance

    }

    getDensityColor() {
        colorMode(HSB);

        let baseHue = 280;  // purple base
        let hueShift = 8;   // subtle variation around purple

        //Pulsing shimmer
        let t = frameCount * 0.03;
        let wave = sin(this.localDistance * 0.2 - t);

        // More sensitive density scaling
        let rawDensity = this.localDensity;
        let normDensity = constrain(map(rawDensity, 0, 20, 0, 1), 0, 1);

        // Gleam modulation (global variable)
        let gleamStrength = pow(normDensity, 1.2) * pow(gleamPhase, 2.0);


        // Color controls
        let hue = baseHue + gleamStrength * hueShift;             // stays near purple
        let saturation = lerp(30, 40, normDensity + gleamStrength * 0.6);
        let base = lerp(40, 65, normDensity); // darker overall

        let shimmer = wave * 40;

        let spike = 35 * pow(gleamStrength, 1.5); // <- strong only at top of curve
        let brightness = base + shimmer + spike;

        saturation += 40 * gleamStrength;
        brightness += 40 * gleamStrength;
        hue = constrain(hue, 270, 290);

        let c = color(hue, saturation, brightness);
        colorMode(RGB);
        return c;
    }


    fleePredator(predator) {
        let safeDistance = 65;
        let d = p5.Vector.dist(this.position, predator.position);
        if (d < safeDistance) {
            let flee = p5.Vector.sub(this.position, predator.position);
            flee.normalize();
            flee.mult(this.maxSpeed);
            flee.sub(this.velocity);
            flee.limit(this.maxForce * 1.5);  // stronger than regular steering
            return flee;
        } else {
            return createVector(0, 0);
        }
    }


    computeDensity(boids) {
        let sum = createVector(0, 0);
        let count = 0;

        for (let b of boids) {
            if (b !== this) {
                let d = p5.Vector.dist(this.position, b.position);
                if (d < 60) {
                    sum.add(b.position);
                    count++;
                }
            }
        }

        this.localDensity = count;
        this.localCenter = (count > 0) ? sum.div(count) : this.position.copy();
        this.localDistance = p5.Vector.dist(this.position, this.localCenter);
    }



    run(boids, predator) {
        this.flock(boids, predator);
        this.update();
        this.borders();
        this.computeDensity(boids);
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
        let flee = this.fleePredator(predator);

        separation.mult(1.5);
        alignment.mult(1.0);
        cohesion.mult(1.0);
        flee.mult(2.0);

        this.applyForce(separation, 1);
        this.applyForce(alignment, 1);
        this.applyForce(cohesion, 1);
        this.applyForce(flee, 2);
    }

    update() {
        this.velocity.add(this.acceleration);

        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);

        this.acceleration.mult(0);

        this.densityCycle = (this.densityCycle + 0.01) % 1.0;
        if (this.localDensity > 1) {
            this.densityTime = (this.densityTime + 0.01) % 1.0;
        }
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
        // Color based on density + cycling
        //this.color = this.getDensityColor(this.density, this.densityCycle);
        this.color = this.getDensityColor();



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


    separate(boids) {
        let desiredSeparation = 25.0;
        let steer = createVector(0, 0);
        let count = 0;


        for (let boid of boids) {
            cnt++;
            let distanceToNeighbor = p5.Vector.dist(this.position, boid.position);

            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (distanceToNeighbor > 0 && distanceToNeighbor < desiredSeparation) {
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
    align(boids) {
        let neighborDistance = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            cnt++;
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < neighborDistance) {
                sum.add(boids[i].velocity);
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
    cohesion(boids) {
        let neighborDistance = 50;
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            cnt++;
            let d = p5.Vector.dist(this.position, boids[i].position);
            if (d > 0 && d < neighborDistance) {
                sum.add(boids[i].position); // Add location
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


class Predator {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 2.5;
    this.maxForce = 0.05;
    this.size = 6;
      
    this.speedBoostPhase = random(TWO_PI);
    this.gleamTime = 0;

  }

  update() {
    this.gleamTime += 0.02;
    let boostFactor = 1 + 0.5 * sin(this.gleamTime + this.speedBoostPhase); // 1x to 1.5x speed

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed * boostFactor);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
}


  applyForce(force) {
    this.acceleration.add(force);
  }

  chase(boids) {
    // Chase center of mass
    let center = createVector(0, 0);
    for (let b of boids) {
      center.add(b.position);
    }
    center.div(boids.length);

    let desired = p5.Vector.sub(center, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  render() {
    let theta = this.velocity.heading() + radians(90);

    // Gleam brightness using cosine wave
    let gleam = 40 + 50 * abs(sin(this.gleamTime * 2));  // brightness oscillates between 70-100
    let bright = 50 + 10 * abs(sin(this.gleamTime * 2));
    let hue = 55 + 15 * abs(sin(this.gleamTime * 2));

    colorMode(HSB);
    let gleamColor = color(hue, bright, gleam); // Yellow HSB: hue 55
    colorMode(RGB);

    boidLayer.push();
    boidLayer.translate(this.position.x, this.position.y);
    boidLayer.rotate(theta);
    boidLayer.fill(gleamColor);
    boidLayer.stroke(0);
    boidLayer.beginShape();
    boidLayer.vertex(0, -this.size * 2);
    boidLayer.vertex(-this.size, this.size * 2);
    boidLayer.vertex(this.size, this.size * 2);
    boidLayer.endShape(CLOSE);
      boidLayer.pop();
      
    }


  run(boids) {
    this.chase(boids);
    this.update();
    this.render();
  }
}
