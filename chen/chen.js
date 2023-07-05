

let easycam;
let particles = [];

let points = [];
let points2 = [];

let attractor;

let NUM_POINTS = 3600;//num of points in curve

let numMax = 600;
let t = 0;
let h = 0.01;
let currentParticle = 0;

// settings and presets
let parDef = {
Attractor: 'Chen',
Speed: 1.0,
Particles: true,
Preset: function() {
    removeElements();
    this.Particles = true;
    this.Speed = 1.0;
    attractor.alpha = 5.0;
    attractor.beta = -10.0;
    attractor.delta =-0.38;
    attractor.x = 5;
    attractor.y = 10;
    attractor.z = 10;
    attractor.x2 = -7;
    attractor.y2 = -5;
    attractor.z2 = -10;
    for (var i=points.length-1; i>=0; i-=1){
        points.splice(i,1);
        points2.splice(i,1);
    }
    initSketch();
},
Randomize: randomCurve,
};


function backAttractors () {
    window.location.href = "";
}

function setup() {
    
    attractor = new ChenAttractor();
    
    // create gui (dat.gui)
    let gui = new dat.GUI();
    gui.add(parDef, 'Attractor');
    gui.add(parDef, 'Speed', 0, 5, 0.01).listen();
    gui.add(parDef, 'Particles' );
    gui.add(parDef, 'Randomize'  );
    gui.add(parDef, 'Preset'  );
    gui.add(this, 'backAttractors').name("Go Back");
    
    pixelDensity(1);
    
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    setAttributes('antialias', true);
    
    console.log(Dw.EasyCam.INFO);
    
    easycam = new Dw.EasyCam(this._renderer, {distance : 45});
    
    // place initial samples
    initSketch();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    easycam.setViewport([0,0,windowWidth, windowHeight]);
    
}

function randomCurve() {
    removeElements();

    for (var i = points.length-1; i>=0; i-=1){
        points.splice(i,1);
        points2.splice(i,1);
    }
    
    attractor.randomize();
    initSketch();
    
}

function initSketch(){
    
    var hleft = select('#hud-left');
    var hright = select('#hud-right');
    
    createElement('li', 'alpha = '+ nfc(attractor.alpha,2) ).parent(hleft);
    createElement('li', 'beta = '+ nfc(attractor.beta,2) ).parent(hleft);
    createElement('li', 'delta = '+ nfc(attractor.delta,2) ).parent(hleft);
    
    createElement('li', '----------' ).parent(hleft);
    createElement('h3', 'Init. Cond.' ).parent(hleft);
    
    createElement('li', 'x<sub>1</sub> = '+ nfc(attractor.x,2) ).parent(hleft);
    createElement('li', 'y<sub>1</sub> = '+ nfc(attractor.y,2) ).parent(hleft);
    createElement('li', 'z<sub>1</sub> = '+ nfc(attractor.z,2) ).parent(hleft);
    
    createElement('li', '----------' ).parent(hleft);
    
    createElement('li', 'x<sub>2</sub> = '+ nfc(attractor.x2,2) ).parent(hleft);
    createElement('li', 'y<sub>2</sub> = '+ nfc(attractor.y2,2) ).parent(hleft);
    createElement('li', 'z<sub>2</sub> = '+ nfc(attractor.z2,2) ).parent(hleft);
    
    let p = {
    x: attractor.x,
    y: attractor.y,
    z: attractor.z
    }
    
    for( var j = 0; j < NUM_POINTS; j++ ) {
        
        p = attractor.generatePoint( p.x, p.y, p.z );
        if( isNaN( p.x ) || isNaN( p.y ) || isNaN( p.z ) ) {
            console.log( 'Failed, retry' );
            randomCurve();
            return;
        }
        
        points.push(new p5.Vector(attractor.scale * p.x,attractor.scale * p.y, attractor.scale * p.z));
        
    }
    
    let q = {
    x: attractor.x2,
    y: attractor.y2,
    z: attractor.z2
    }
    
    for( var j = 0; j < NUM_POINTS; j++ ) {
        
        q = attractor.generatePoint( q.x, q.y, q.z );
        
        if( isNaN( q.x ) || isNaN( q.y ) || isNaN( q.z ) ) {
            console.log( 'Failed, retry' );
            randomCurve()
            return;
        }
       
        points2.push(new p5.Vector(attractor.scale * q.x,attractor.scale * q.y, attractor.scale * q.z));
        
    }
    
    let m = 20;
    for (var i=0; i < numMax; i++) {
        particles[i] = new Particle(random(-m, m), random(-m, m), random(-m, m), t, h);
    }
    
}


function draw(){
    
    // projection
    perspective(60 * PI/180, width/height, 1, 5000);
    
    // BG
    background(0);
    
    rotateX(0.3);
    rotateY(-1);
   
    beginShape(POINTS);
    for (let v of points) {
        stroke(100, 193, 255);
        strokeWeight(0.08);
        vertex(v.x, v.y, v.z);
        
    }
    endShape();
    
    
    beginShape(POINTS);
    for (let n of points2) {
        stroke(153, 51, 255);
        strokeWeight(0.08);
        vertex(n.x, n.y, n.z);
        
    }
    endShape();
    
    if(parDef.Particles==true){
    //updating and displaying the particles
    for (let i=particles.length-1; i>=0; i-=1) {
        let p = particles[i];
        p.update();
        p.display();
        if ( p.x > 80 ||  p.y > 80 || p.z > 80 || p.x < -80 ||  p.y < -80 || p.z < -80 ) {
            particles.splice(i,1);
            currentParticle--;
            particles.push(new Particle(random(-5,5),random(-5,5),random(0,5),t,h) );
        }
    }
    }
    
    // gizmo
    //strokeWeight(0.1);
    //stroke(255, 32,  0); line(0,0,0,2,0,0);
    //stroke( 32,255, 32); line(0,0,0,0,2,0);
    //stroke(  0, 32,255); line(0,0,0,0,0,2);
    
}


const componentFX = (t, x, y, z) => parDef.Speed*( attractor.alpha * x- y * z );//Change this function

const componentFY = (t, x, y, z) => parDef.Speed*(  attractor.beta * y + x * z);//Change this function

const componentFZ = (t, x, y, z) => parDef.Speed*( attractor.delta * z + x * y/3  );//Change this function

// Runge-Kutta method
function rungeKutta(time, x, y, z, h) {
    let k1 = componentFX(time, x, y, z);
    let j1 = componentFY(time, x, y, z);
    let i1 = componentFZ(time, x, y, z);

    let k2 = componentFX(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k1,
        y + (1 / 2) * h * j1,
        z + (1 / 2) * h * i1
    );
    let j2 = componentFY(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k1,
        y + (1 / 2) * h * j1,
        z + (1 / 2) * h * i1
    );
    let i2 = componentFZ(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k1,
        y + (1 / 2) * h * j1,
        z + (1 / 2) * h * i1
    );
    let k3 = componentFX(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k2,
        y + (1 / 2) * h * j2,
        z + (1 / 2) * h * i2
    );
    let j3 = componentFY(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k2,
        y + (1 / 2) * h * j2,
        z + (1 / 2) * h * i2
    );
    let i3 = componentFZ(
        time + (1 / 2) * h,
        x + (1 / 2) * h * k2,
        y + (1 / 2) * h * j2,
        z + (1 / 2) * h * i2
    );
    let k4 = componentFX(time + h, x + h * k3, y + h * j3, z + h * i3);
    let j4 = componentFY(time + h, x + h * k3, y + h * j3, z + h * i3);
    let i4 = componentFZ(time + h, x + h * k3, y + h * j3, z + h * i3);
    x = x + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    y = y + (h / 6) * (j1 + 2 * j2 + 2 * j3 + j4);
    z = z + (h / 6) * (i1 + 2 * i2 + 2 * i3 + i4);
    return {
        u: x,
        v: y,
        w: z
    };
}

//Particle definition and motion
class Particle{
    
    constructor(_x, _y, _z, _t, _h){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.time = _t;
        this.radius = random(0.2,0.2);
        this.h = _h;
        this.op = random(200,200);
        this.r = random(255,255);
        this.g = random(255);
        this.b = random(255);
    }
    
    update() {
        let tmp = rungeKutta(this.time, this.x, this.y, this.z, this.h);

        this.x = tmp.u;
        this.y = tmp.v;
        this.z = tmp.w;

        this.time += this.h;
    }
    
    display() {
        push();
        translate(this.x, this.y, this.z);
        ambientMaterial(this.r, this.b, this.g);
        noStroke();
        sphere(this.radius, 7, 6);
        pop();
    }
    
}

class ChenAttractor {
    
    constructor(){
    this.speed = 0.5;
    
    this.alpha = 5.0;
    this.beta = -10.0;
    this.delta = -0.38;
    
    this.x = 5;
    this.y = 10;
    this.z = 10;
    
    this.x2 = -7;
    this.y2 = -5;
    this.z2 = -10;
    
    this.h = .02;
    this.scale = 1;
    }
    
    generatePoint( x, y, z ) {
        
        
        var nx = this.speed * (this.alpha * x- y * z ) ;
        var ny =  this.speed * (this.beta * y + x * z) ;
        var nz =  this.speed * (this.delta * z + x * y/3);
        
        x += this.h * nx; y += this.h * ny; z += this.h * nz;
        
        return { x: x, y: y, z: z }
        
    }
    
    randomize() {
        
        this.alpha = random( 3, 5 );
        this.beta = random( -10, -7 );
        this.delta = random( -0.5, 0.1 );
        
        this.x = random( -5, 5 );
        this.y = random( -5, 10 );
        this.z = random( -10, 10 );
        
        this.x2 = random( -5, 5 );
        this.y2 = random( -5, 10 );
        this.z2 = random( -10, 10 );
        
    }
    
}
