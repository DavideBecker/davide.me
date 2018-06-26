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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFFBQUEsRUFBQSxhQUFBLEVBQUEsRUFBQSxFQUFBLGNBQUEsRUFBQTs7RUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBQTs7RUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQWIsR0FBaUIsTUFBTSxDQUFDLEtBQVAsR0FBZTs7RUFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFiLEdBQWlCLE1BQU0sQ0FBQzs7RUFDeEIsY0FBQSxHQUFpQjs7RUFDakIsRUFBQSxHQUFLLEVBSkw7Ozs7O0VBVUEsUUFBQSxHQUFXLFFBQUEsQ0FBRSxNQUFGLENBQUE7V0FDVCxJQUFJLENBQUMsS0FBTCxDQUFZLE1BQVo7RUFEUzs7RUFHWCxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQW5CLEdBQTJCLFFBQUEsQ0FBQyxNQUFELENBQUE7SUFDekIsSUFBSSxDQUFDLEtBQUwsR0FBYSxNQUFNLENBQUM7SUFDcEIsSUFBSSxDQUFDLENBQUwsR0FBUyxNQUFNLENBQUM7SUFDaEIsSUFBSSxDQUFDLENBQUwsR0FBUyxNQUFNLENBQUM7SUFDaEIsSUFBSSxDQUFDLEtBQUwsR0FBYSxNQUFNLENBQUM7SUFDcEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxNQUFNLENBQUM7V0FDckIsSUFBSSxDQUFDLEtBQUwsR0FBYSxNQUFNLENBQUM7RUFOSyxFQWIzQjs7Ozs7RUF5QkEsYUFBQSxHQUFnQixRQUFBLENBQUMsTUFBRCxDQUFBO0lBQ2QsSUFBSSxDQUFDLENBQUwsR0FBUztJQUNULElBQUksQ0FBQyxTQUFMLEdBQWlCO0lBQ2pCLElBQUksQ0FBQyxLQUFMLEdBQWEsTUFBTSxDQUFDO0lBQ3BCLElBQUksQ0FBQyxLQUFMLEdBQ0U7TUFBQSxHQUFBLEVBQUssTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFsQjtNQUNBLEdBQUEsRUFBSyxNQUFNLENB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Q0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixRQUFBLENBQUMsQ0FBRCxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBYixHQUFpQixDQUFDLENBQUM7V0FDbkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFiLEdBQWlCLENBQUMsQ0FBQztFQUZPLENBQTVCO0FBMUlBIiwic291cmNlc0NvbnRlbnQiOlsic2tldGNoID0gU2tldGNoLmNyZWF0ZSgpXG5za2V0Y2gubW91c2UueCA9IHNrZXRjaC53aWR0aCAvIDEwXG5za2V0Y2gubW91c2UueSA9IHNrZXRjaC5oZWlnaHRcbm1vdW50YWluUmFuZ2VzID0gW11cbmR0ID0gMVxuXG4jXG4jIE1PVU5UQUlOU1xuI1xuICBcbk1vdW50YWluID0gKCBjb25maWcgKSAtPlxuICB0aGlzLnJlc2V0KCBjb25maWcgKVxuXG5Nb3VudGFpbi5wcm90b3R5cGUucmVzZXQgPSAoY29uZmlnKSAtPlxuICB0aGlzLmxheWVyID0gY29uZmlnLmxheWVyXG4gIHRoaXMueCA9IGNvbmZpZy54XG4gIHRoaXMueSA9IGNvbmZpZy55XG4gIHRoaXMud2lkdGggPSBjb25maWcud2lkdGhcbiAgdGhpcy5oZWlnaHQgPSBjb25maWcuaGVpZ2h0XG4gIHRoaXMuY29sb3IgPSBjb25maWcuY29sb3IgIFxuXG4jXG4jIE1PVU5UQUlOIFJBTkdFXG4jXG5cbk1vdW50YWluUmFuZ2UgPSAoY29uZmlnKSAtPiBcbiAgdGhpcy54ID0gMFxuICB0aGlzLm1vdW50YWlucyA9IFtdXG4gIHRoaXMubGF5ZXIgPSBjb25maWcubGF5ZXJcbiAgdGhpcy53aWR0aCA9XG4gICAgbWluOiBjb25maWcud2lkdGgubWluXG4gICAgbWF4OiBjb25maWcud2lkdGgubWF4XG4gIHRoaXMuaGVpZ2h0ID1cbiAgICBtaW46IGNvbmZpZy5oZWlnaHQubWluXG4gICAgbWF4OiBjb25maWcuaGVpZ2h0Lm1heFxuICB0aGlzLnNwZWVkID0gY29uZmlnLnNwZWVkXG4gIHRoaXMuY29sb3IgPSBjb25maWcuY29sb3JcbiAgdGhpcy5wb3B1bGF0ZSgpXG4gIHJldHVybiB0aGlzXG4gIFxuTW91bnRhaW5SYW5nZS5wcm90b3R5cGUucG9wdWxhdGUgPSAtPlxuICB0b3RhbFdpZHRoID0gMFxuICB3aGlsZSB0b3RhbFdpZHRoIDw9IHNrZXRjaC53aWR0aCArICggdGhpcy53aWR0aC5tYXggKiA0IClcbiAgICBuZXdXaWR0aCA9IHJvdW5kICggcmFuZG9tKCB0aGlzLndpZHRoLm1pbiwgdGhpcy53aWR0aC5tYXggKSApXG4gICAgbmV3SGVpZ2h0ID0gcm91bmQgKCByYW5kb20oIHRoaXMuaGVpZ2h0Lm1pbiwgdGhpcy5oZWlnaHQubWF4ICkgKVxuICAgIHRoaXMubW91bnRhaW5zLnB1c2goIG5ldyBNb3VudGFpbihcbiAgICAgIGxheWVyOiB0aGlzLmxheWVyXG4gICAgICB4OiBpZiB0aGlzLm1vdW50YWlucy5sZW5ndGggPT0gMCB0aGVuIDAgZWxzZSAoIHRoaXMubW91bnRhaW5zWyB0aGlzLm1vdW50YWlucy5sZW5ndGggLSAxIF0ueCArIHRoaXMubW91bnRhaW5zWyB0aGlzLm1vdW50YWlucy5sZW5ndGggLSAxIF0ud2lkdGggKVxuICAgICAgeTogc2tldGNoLmhlaWdodCAtIG5ld0hlaWdodFxuICAgICAgd2lkdGg6IG5ld1dpZHRoXG4gICAgICBoZWlnaHQ6IG5ld0hlaWdodFxuICAgICAgY29sb3I6IHRoaXMuY29sb3JcbiAgICApIClcbiAgICB0b3RhbFdpZHRoICs9IG5ld1dpZHRoXG5cbk1vdW50YWluUmFuZ2UucHJvdG90eXBlLnVwZGF0ZSA9IC0+XG4gIHRoaXMueCAtPSAoIHNrZXRjaC5tb3VzZS54ICogdGhpcy5zcGVlZCApICogZHRcbiAgICAgIFxuICBmaXJzdE1vdW50YWluID0gdGhpcy5tb3VudGFpbnNbIDAgXVxuICBpZiBmaXJzdE1vdW50YWluLndpZHRoICsgZmlyc3RNb3VudGFpbi54ICsgdGhpcy54IDwgLXRoaXMud2lkdGgubWF4XG4gICAgbmV3V2lkdGggPSByb3VuZCAoIHJhbmRvbSggdGhpcy53aWR0aC5taW4sIHRoaXMud2lkdGgubWF4ICkgKVxuICAgIG5ld0hlaWdodCA9IHJvdW5kICggcmFuZG9tKCB0aGlzLmhlaWdodC5taW4sIHRoaXMuaGVpZ2h0Lm1heCApIClcbiAgICBsYXN0TW91bnRhaW4gPSB0aGlzLm1vdW50YWluc1sgdGhpcy5tb3VudGFpbnMubGVuZ3RoIC0gMSBdICAgIFxuICAgIGZpcnN0TW91bnRhaW4ucmVzZXQoXG4gICAgICBsYXllcjogdGhpcy5sYXllclxuICAgICAgeDogbGFzdE1vdW50YWluLnggKyBsYXN0TW91bnRhaW4ud2lkdGhcbiAgICAgIHk6IHNrZXRjaC5oZWlnaHQgLSBuZXdIZWlnaHRcbiAgICAgIHdpZHRoOiBuZXdXaWR0aFxuICAgICAgaGVpZ2h0OiBuZXdIZWlnaHRcbiAgICAgIGNvbG9yOiB0aGlzLmNvbG9yXG4gICAgKSAgICBcbiAgICB0aGlzLm1vdW50YWlucy5wdXNoKCB0aGlzLm1vdW50YWlucy5zaGlmdCgpIClcbiAgXG5Nb3VudGFpblJhbmdlLnByb3RvdHlwZS5yZW5kZXIgPSAtPlxuICBza2V0Y2guc2F2ZSgpXG4gIHNrZXRjaC50cmFuc2xhdGUoIHRoaXMueCwgKCBza2V0Y2guaGVpZ2h0IC0gc2tldGNoLm1vdXNlLnkgKSAvIDIwICogdGhpcy5sYXllciApICAgICBcbiAgc2tldGNoLmJlZ2luUGF0aCgpXG4gIHBvaW50Q291bnQgPSB0aGlzLm1vdW50YWlucy5sZW5ndGhcbiAgc2tldGNoLm1vdmVUbyh0aGlzLm1vdW50YWluc1swXS54LCB0aGlzLm1vdW50YWluc1swXS55KSAgXG4gIGZvciBpIGluIFswLi4ocG9pbnRDb3VudC0yKV0gYnkgMVxuICAgIGMgPSAodGhpcy5tb3VudGFpbnNbaV0ueCArIHRoaXMubW91bnRhaW5zW2kgKyAxXS54KSAvIDJcbiAgICBkID0gKHRoaXMubW91bnRhaW5zW2ldLnkgKyB0aGlzLm1vdW50YWluc1tpICsgMV0ueSkgLyAyXG4gICAgc2tldGNoLnF1YWRyYXRpY0N1cnZlVG8odGhpcy5tb3VudGFpbnNbaV0ueCwgdGhpcy5tb3VudGFpbnNbaV0ueSwgYywgZClcbiAgc2tldGNoLmxpbmVUbyhza2V0Y2gud2lkdGggLSB0aGlzLngsIHNrZXRjaC5oZWlnaHQpXG4gIHNrZXRjaC5saW5lVG8oMCAtIHRoaXMueCwgc2tldGNoLmhlaWdodCkgIFxuICBza2V0Y2guY2xvc2VQYXRoKClcbiAgc2tldGNoLmZpbGxTdHlsZSA9IHRoaXMuY29sb3JcbiAgc2tldGNoLmZpbGwoKSAgICBcbiAgc2tldGNoLnJlc3RvcmUoKVxuXG4jXG4jIFNFVFVQXG4jXG4gIFxuc2tldGNoLnNldHVwID0gLT4gICAgXG4gIGkgPSA1XG4gIHdoaWxlIGktLVxuICAgIG1vdW50YWluUmFuZ2VzLnB1c2goIG5ldyBNb3VudGFpblJhbmdlKFxuICAgICAgbGF5ZXI6IGkgKyAxXG4gICAgICB3aWR0aDpcbiAgICAgICAgbWluOiAoIGkgKyAxICkgKiA1MFxuICAgICAgICBtYXg6ICggaSArIDEgKSAqIDcwXG4gICAgICBoZWlnaHQ6XG4gICAgICAgIG1pbjogMjAwIC0gKCAoIGkgKSAqIDQwIClcbiAgICAgICAgbWF4OiAzMDAgLSAoICggaSApICogNDAgKVxuICAgICAgc3BlZWQ6ICggaSArIDEgKSAqIC4wMDNcbiAgICAgIGNvbG9yOiAnaHNsKCAxMjAsICcgKyAoICggKCBpICsgMSApICogMSApICsgMTAgKSArICclLCAnICsgKCA3NSAtICggaSAqIDEzICkgKSArICclICknXG4gICAgKSApXG4gICAgXG4jXG4jIENMRUFSXG4jXG4gIFxuc2tldGNoLmNsZWFyID0gLT5cbiAgc2tldGNoLmNsZWFyUmVjdCggMCwgMCwgc2tldGNoLndpZHRoLCBza2V0Y2guaGVpZ2h0IClcblxuI1xuIyBVUERBVEVcbiNcbiAgXG5za2V0Y2gudXBkYXRlID0gLT5cbiAgZHQgPSBpZiBza2V0Y2guZHQgPCAuMSB0aGVuIC4xIGVsc2Ugc2tldGNoLmR0IC8gMTZcbiAgZHQgPSBpZiBkdCA+IDUgdGhlbiA1IGVsc2UgZHRcbiAgaSA9IG1vdW50YWluUmFuZ2VzLmxlbmd0aFxuICBtb3VudGFpblJhbmdlc1sgaSBdLnVwZGF0ZSggaSApIHdoaWxlIGktLVxuICBcbiNcbiMgRFJBV1xuI1xuICBcbnNrZXRjaC5kcmF3ID0gLT5cbiAgaSA9IG1vdW50YWluUmFuZ2VzLmxlbmd0aFxuICBtb3VudGFpblJhbmdlc1sgaSBdLnJlbmRlciggaSApIHdoaWxlIGktLVxuXG4jXG4jIE1vdXNlbW92ZSBGaXhcbiMgIFxuICAgIFxuJCggd2luZG93ICkub24gJ21vdXNlbW92ZScsIChlKSAtPlxuICBza2V0Y2gubW91c2UueCA9IGUucGFnZVhcbiAgc2tldGNoLm1vdXNlLnkgPSBlLnBhZ2VZIl19
//# sourceURL=coffeescript