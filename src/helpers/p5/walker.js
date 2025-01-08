src(s0)
    //.modulateScale(noize(15),.2)
    //.modulateScale(src(o0).scale(1.02), 0.8)
    //repeat (2,2)
    //.blend(src(s0).lum/a())
    .colorama(5)
    .add(src(o0).scale(1.05), .98)
    .luma()
    .out()

P5.toggle(0)
H.pd()
s0.initP5()


let libs = [
    'https://tetunori.github.io/BMWalker.js/dist/v0.6.1/bmwalker.js',
    'https://unpkg.com/hydra-synth',
    'includes/libs/hydra-synth.js',
    'https://cdn.jsdelivr.net/gh/ffd8/hy5@main/hy5.js', 'includes/libs/hy5.js']

const bmw = new BMWalker(0);


function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL)
}

function draw() {
    orbitControl(3);
    H.get(); // Hydra texture integration

    background(0, 25);

    // Hydra texture on a plane
    push();
    texture(h0);
    translate(0, 0, -100);
    plane(width * 0.99, height * 0.99);
    pop();

    // Set BMWalker parameters
    bmw.setSpeed(1.2);
    bmw.setWalkerParam(2, 0.8, 0.5, 10);

    // Draw walker
    let x = bmw.getX();
    let y = bmw.getY();
    fill(255, 200);
    noStroke();
    ellipse(x, y, 15, 15);

    // Draw trail from history
    let history = bmw.getHistory();
    history.forEach(([hx, hy], index) => {
        fill(255, 100 - index * 5); // Fade effect
        ellipse(hx, hy, 5, 5);
    });

    // 3D object example
    push();
    normalMaterial();
    translate(x - width / 2, y - height / 2, 0);
    sphere(20);
    pop();
}
