(function () {
    var Mountain, MountainRange, dt, mountainRanges, sketch;

    sketch = Sketch.create();

    sketch.mouse.x = sketch.width / 10;

    sketch.mouse.y = sketch.height;

    mountainRanges = [];

    dt = 1;


    var Particle, particleCount, particles, sketch, z;

    particles = [];

    particleCount = Math.max(Math.round(sketch.width * sketch.height / 2500), 350);

    sketch.mouse.x = sketch.width / 2;

    sketch.mouse.y = sketch.height / 2;


    // Particle Constructor
    Particle = function () {
        this.x = random(sketch.width);
        this.y = random(sketch.height, sketch.height * 2);
        this.vx = 0;
        this.vy = -random(1, 10) / 5;
        this.radius = this.baseRadius = 1;
        this.maxRadius = 50;
        this.threshold = Math.max(particleCount / 4, 100);
        return this.hue = random(190, 210);
    };

    // Particle Prototype
    Particle.prototype = {
        update: function () {
            var dist, distx, disty, radius;
            // Determine Distance From Mouse
            distx = this.x - sketch.mouse.x;
            disty = this.y - sketch.mouse.y;
            dist = sqrt(distx * distx + disty * disty);

            // Set Radius
            if (dist < this.threshold) {
                radius = this.baseRadius + ((this.threshold - dist) / this.threshold) * this.maxRadius;
                this.radius = radius > this.maxRadius ? this.maxRadius : radius;
            } else {
                this.radius = this.baseRadius;
            }

            // Adjust Velocity
            this.vx += (random(100) - 50) / 1000;
            this.vy -= random(1, 20) / 10000;

            // Apply Velocity
            this.x += this.vx;
            this.y += this.vy;

            // Check Bounds   
            if (this.x < -this.maxRadius || this.x > sketch.width + this.maxRadius || this.y < -this.maxRadius) {
                this.x = random(sketch.width);
                this.y = random(sketch.height + this.maxRadius, sketch.height * 2);
                this.vx = 0;
                return this.vy = -random(1, 10) / 5;
            }
        },
        render: function () {
            sketch.beginPath();
            sketch.arc(this.x, this.y, this.radius, 0, TWO_PI);
            sketch.closePath();
            //hsl(200, 100%, 61%)
            sketch.fillStyle = 'hsla(' + this.hue + ', 100%, 61%, .35)';
            sketch.fill();
            return sketch.stroke();
        }
    };

    // Create Particles
    z = particleCount;

    while (z--) {
        particles.push(new Particle());
    }


    // MOUNTAINS

    Mountain = function (config) {
        return this.reset(config);
    };

    Mountain.prototype.reset = function (config) {
        this.layer = config.layer;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        return this.color = config.color;
    };


    // MOUNTAIN RANGE

    MountainRange = function (config) {
        this.x = 0;
        this.mountains = [];
        this.layer = config.layer;
        this.width = {
            min: config.width.min,
            max: config.width.max
        };
        this.height = {
            min: config.height.min,
            max: config.height.max
        };
        this.speed = config.speed;
        this.color = config.color;
        this.populate();
        return this;
    };

    MountainRange.prototype.populate = function () {
        var newHeight, newWidth, results, totalWidth;
        totalWidth = 0;
        results = [];
        while (totalWidth <= sketch.width + (this.width.max * 4)) {
            newWidth = round(random(this.width.min, this.width.max));
            newHeight = round(random(this.height.min, this.height.max));
            this.mountains.push(new Mountain({
                layer: this.layer,
                x: this.mountains.length === 0 ? 0 : this.mountains[this.mountains.length - 1].x + this.mountains[this.mountains.length - 1].width,
                y: sketch.height - newHeight,
                width: newWidth,
                height: newHeight,
                color: this.color
            }));
            results.push(totalWidth += newWidth);
        }
        return results;
    };

    MountainRange.prototype.update = function () {
        var firstMountain, lastMountain, newHeight, newWidth;
        this.x -= (500 * this.speed) * dt;
        firstMountain = this.mountains[0];
        if (firstMountain.width + firstMountain.x + this.x < -this.width.max) {
            newWidth = round(random(this.width.min, this.width.max));
            newHeight = round(random(this.height.min, this.height.max));
            lastMountain = this.mountains[this.mountains.length - 1];
            firstMountain.reset({
                layer: this.layer,
                x: lastMountain.x + lastMountain.width,
                y: sketch.height - newHeight,
                width: newWidth,
                height: newHeight,
                color: this.color
            });
            return this.mountains.push(this.mountains.shift());
        }
    };

    MountainRange.prototype.render = function () {
        var c, d, i, j, pointCount, ref;
        sketch.save();
        sketch.translate(this.x, 0);
        sketch.beginPath();
        pointCount = this.mountains.length;
        sketch.moveTo(this.mountains[0].x, this.mountains[0].y);
        for (i = j = 0, ref = pointCount - 2; j <= ref; i = j += 1) {
            c = (this.mountains[i].x + this.mountains[i + 1].x) / 2;
            d = (this.mountains[i].y + this.mountains[i + 1].y) / 2;
            sketch.quadraticCurveTo(this.mountains[i].x, this.mountains[i].y, c, d);
        }
        sketch.lineTo(sketch.width - this.x, sketch.height);
        sketch.lineTo(0 - this.x, sketch.height);
        sketch.closePath();
        sketch.fillStyle = this.color;
        sketch.fill();
        return sketch.restore();
    };


    // SETUP

    sketch.setup = function () {
        var i, results;
        i = 5;
        results = [];
        while (i--) {
            results.push(mountainRanges.push(new MountainRange({
                layer: i + 1,
                width: {
                    min: 2 * 50,
                    max: 2 * 70
                },
                height: {
                    min: sketch.height - (i * 100) - sketch.height / 1.75,
                    max: sketch.height - (i * 100) - sketch.height / 2
                },
                speed: (i + 1) * .003,
                //	hsl(200, 100%, 61%)
                color: 'hsl( 200, ' + (100 - ((i + 1) * 1)) + '%, ' + (61 - (i * 13)) + '% )'
            })));
        }
        return results;
    };


    // CLEAR

    sketch.clear = function () {
        return sketch.clearRect(0, 0, sketch.width, sketch.height);
    };


    // UPDATE

    sketch.update = function () {
        var i, ii, results;

        dt = sketch.dt < .1 ? .1 : sketch.dt / 16;
        dt = dt > 5 ? 5 : dt;
        results = [];

        ii = particles.length;
        while (ii--) {
            results.push(particles[ii].update());
        }

        i = mountainRanges.length;
        while (i--) {
            results.push(mountainRanges[i].update(i));
        }

        return results;
    };


    // DRAW

    sketch.draw = function () {
        var i, ii, results;
        results = [];

        i = mountainRanges.length;
        while (i--) {
            results.push(mountainRanges[i].render(i));

            if (i == 3) {
                ii = particles.length;
                while (ii--) {
                    results.push(particles[ii].render());
                }
            }
        }
        return results;
    };


    // Mousemove Fix

    $(window).on('mousemove', function (e) {
        sketch.mouse.x = e.pageX;
        return sketch.mouse.y = e.pageY;
    });

}).call(this);

// Copyright (c) 2018 by Jack Rugile (https://codepen.io/jackrugile/pen/IjKLt & https://codepen.io/jackrugile/pen/Apfyn)

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.