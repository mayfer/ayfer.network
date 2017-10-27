
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

    var ctx = self.ctx; // shortcut

    if(options === undefined) { options = {}; }
    self.options = extend({
        resizeWithWindow: true,
    }, options);

    self.hover = function(percent) {
    };

    self.reset = function() {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
    };
    
    self.render = function() {
        self.reset();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(self.moon.center.x, self.moon.center.y, self.moon.size, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fill();

        self.lines.forEach(function(line) {
            var y = self.moon.center.y + 150 + (Math.pow(line.index+3, 2) * 1);
            self.draw_waveline(y, line);
        });

    };

    self.draw_waveline = function(y, line) {
        var radius = 60 + line.index*10;
        var pos = {
            x: self.moon.center.x + radius,
            y: y,
        }
        for(var x = 0; x <= radius*2; x+=2) {
            var val = 0;
            var der = 0;
            for(var i=0; i<line.waves.length; i++) {
                var wave = line.waves[i];
                der += Math.cos(wave.iter) * Math.sin( (x / (radius*2)) * Math.PI * 2 * (wave.freq / 220)) * wave.amplitude;
                val += Math.sin(wave.iter) * Math.cos( (x / (radius*2)) * Math.PI * 2 * (wave.freq / 220)) * wave.amplitude;
                wave.iter += wave.adjusted_freq;
            }

            var opacity = der / 10;
            var size = Math.max(0, (der) * 2/Math.sqrt(Math.abs(line.index - 10)));
            ctx.fillStyle = 'rgba(255, 255, 255, '+opacity+')';
            //ctx.lineTo(pos.x - x, pos.y + val);
            ctx.beginPath();
            ctx.arc(pos.x - x, pos.y + val*2, size, Math.PI*0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    self.animate = function(iter) {

        iter += 1;

        window.requestAnimationFrame(function() {
            self.render();
            self.animate(iter);
        });
    };

    
    self.wave = function(freq, amplitude) {
        var wave = this;
        wave.freq = freq;
        wave.phase = 0;
        if(amplitude) {
            wave.amplitude = amplitude;
        } else {
            wave.amplitude = 2;
        }
        wave.iter = Math.random() * Math.PI * 2;
        wave.adjusted_freq = wave.freq/2200000;
    }

    self.resize = function() {
        self.moon = {
            center: {
                x: ctx.width/4,
                y: ctx.height/4,
            },
            size: 30,
        }
        var base_freq = 220;
        self.lines = [];
        for(var j=0; j<20; j+= 1) {
            var waves = [];
            for(var i=0; i<4; i+= 1) {
                var wave = new self.wave(base_freq * (i + Math.random()));
                waves.push(wave);
            }
            self.lines.push({waves: waves, index: j});
        }
    };

    self.init = function() {

        self.resize();
        self.reset();
        self.animate();

    };

    self.init();
    return self;
};
