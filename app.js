
var extend = function(dest, from) {
    var props = Object.getOwnPropertyNames(from);
    props.forEach(function(name) {
        if (name in dest) {
            var destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, destination);
        }
    });
    return dest;
};

var App = function(elem, options) {
    var self = this;

    self.canvas = Canvas(elem);
    self.ctx = self.canvas.getContext("2d");
    self.eyesize = 1;

    var ctx = self.ctx; // shortcut

    var alt_pos;

    if(options === undefined) { options = {}; }
    self.options = extend({
        resizeWithWindow: true,
    }, options);

    self.hover = function(percent) {
    };

    self.reset = function() {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
    };
    
    self.render = function(iter) {
        self.reset();

        if(self.blinking) {
            self.blinkframe += Math.PI/10;
            self.eyesize = Math.pow(Math.abs(Math.cos(self.blinkframe)), 4);
            if(self.blinkframe > Math.PI) {
                self.blinking = false;
                self.eyesize = 1;
            }
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

        ctx.save();
        ctx.shadowBlur = 100;
        ctx.shadowColor = "#fff";
        ctx.beginPath();
        ctx.ellipse(self.moon.center.x, self.moon.center.y, self.moon.size, self.moon.size * self.eyesize, 0, 0, Math.PI*2)
        //ctx.arc(self.moon.center.x, self.moon.center.y, self.moon.size, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        self.lines.forEach(function(line) {
            var y = self.moon.center.y + 200 + (line.index * 30);
            self.draw_waveline(self.moon.center.x, y, line);
        });

        self.lines_alt.forEach(function(line) {
            var y = alt_pos.bottom + (line.index * 30);
            self.draw_waveline(alt_pos.left + alt_pos.width/2, y+8, line);
        });
    };

    self.blink = function() {
        self.blinkframe = 0;
        self.blinking = true;
    }

    self.draw_waveline = function(x, y, line) {
        var radius = line.width;
        var pos = {
            x: x,
            y: y,
        }
        for(var x = -radius; x <= radius; x+=2) {
            var val = 0;
            var der = 0;
            for(var i=0; i<line.waves.length; i++) {
                var wave = line.waves[i];
                var mainfunc = i % 2 == 0 ? Math.sin : Math.cos;
                var derivfunc = i % 2 == 0 ? Math.cos : Math.sin;

                der += derivfunc(wave.iter) * derivfunc( (x / (radius*2)) * Math.PI * 2 * (wave.freq / 220)) * wave.amplitude;
                val += mainfunc(wave.iter) * mainfunc( (x / (radius*2)) * Math.PI * 2 * (wave.freq / 220)) * wave.amplitude;
                wave.iter += wave.adjusted_freq;
            }
            var xdiff = (radius - Math.abs(x)) / radius;
            var visibility = Math.max(0, xdiff * (0.2 + der / 5) * self.eyesize);
            if(visibility > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, '+visibility+')';
                ctx.strokeStyle = ctx.fillStyle;
                ctx.beginPath();
                ctx.lineTo(pos.x - x, pos.y + val*2);
                ctx.arc(pos.x - x, pos.y + val*2, 2, Math.PI*0, Math.PI * 2, false);
                ctx.fill();
            }
        }
    }

    self.animate = function(iter) {

        iter += 1;

        window.requestAnimationFrame(function() {
            self.render(iter);
            self.animate(iter);
        });
    };

    
    self.wave = function(freq, amplitude) {
        var wave = this;
        wave.freq = freq * Math.random()+0.4;
        wave.phase = 0;
        if(amplitude) {
            wave.amplitude = amplitude;
        } else {
            wave.amplitude = 2;
        }
        wave.iter = Math.random() * Math.PI * 2;
        wave.adjusted_freq = Math.random()*wave.freq/1100000;
    }

    self.resize = function() {
        setCanvasSize(self.canvas, self.canvas.offsetWidth, self.canvas.offsetHeight);
        self.moon = {
            center: {
                x: ctx.width/4,
                y: ctx.height/4,
            },
            size: ctx.width/40,
        }
        var base_freq = 220;
        self.lines = [];
        for(var j=0; j<20; j+= 1) {
            var waves = [];
            for(var i=0; i<6; i+= 1) {
                var wave = new self.wave(base_freq * i, 0.4 + j/10);
                waves.push(wave);
            }
            var multiplier = j % 2 == 0 ? (0.5 + Math.random()) : 1;
            self.lines.push({
                waves: waves,
                index: j,
                width: 60 + j * 10 * multiplier,
            });
        }

        var base_freq = 200;
        self.lines_alt = [];
        for(var j=0; j<1; j+= 1) {
            var waves = [];
            for(var i=0; i<6; i+= 1) {
                var wave = new self.wave(base_freq * i, 1);
                waves.push(wave);
            }
            var multiplier = j % 2 == 0 ? (0.5 + Math.random()) : 1;
            self.lines_alt.push({
                waves: waves,
                index: j,
                width: document.getElementById('contact').getBoundingClientRect().width/1.5,
            });
        }
        alt_pos = document.getElementById('contact').getBoundingClientRect();
    };

    self.init = function() {

        self.resize();
        self.reset();
        self.animate();

        $(document).keydown(function(){
            //self.blink();
        });

        $(window).on('resize', self.resize);

    };

    $(document).ready(function() {
        self.init();
    });
    return self;
};
