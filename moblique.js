var gl, program;

const WIRED=0;
const NOT_WIRED=1;
var instances;
var mode=WIRED;

var modelView;
var mModelLoc;
var mView;

var aspect = 2;

var alpha = 45, l=1;

var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame, cylinderDrawWireFrame, torusDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled, cylinderDrawFilled, torusDrawFilled]
];

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mviewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);


    if(instances==undefined)
        drawPrimitive(0);
        
    document.getElementById("new_cube").onclick=function() {
        drawPrimitive(0);
    };

    document.getElementById("new_sphere").onclick=function() {
        drawPrimitive(1);
    };

    document.getElementById("new_cylinder").onclick=function() {
        drawPrimitive(2);
    };

    document.getElementById("new_torus").onclick=function() {
        drawPrimitive(3);
    };

    document.getElementById("reset_all").onclick=function() {
        instances = undefined;
    };



    document.onkeydown = function(event) {
        switch(event.key) {
            case 'w':
                mode = WIRED;
                break;     
            case 's':
                mode = NOT_WIRED;
                break;
        }   
    }

    window.addEventListener("wheel", event => {
        const delta = Math.sign(event.deltaY);
        if(delta>0)
            aspect++;
        else if(aspect>1)
            aspect--;
    });

    //document.getElementById("l").oninput = update_oblique;
    //document.getElementById("alpha").oninput = update_oblique;
    //drawPrimitive(0, 1, program);
    render();
}

function drawPrimitive(primitive){
    instances = {t: mat4(), p: drawFuncs[mode][primitive]};
}


/*
function drawPrimitive(obj, mode, program) {
    //gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
    //gl.uniformMatrix4fv(mviewLoc, false, flatten(modelView));
    drawFuncs[mode][obj](gl, program);
}
*/

function update_oblique() 
{
    l = parseFloat(document.getElementById('l').value);
    alpha = parseFloat(document.getElementById('alpha').value);
}

function buildMobl(l, alpha) { 
    let cosa = Math.cos(alpha * Math.PI / 180.0);
    let sina = Math.sin(alpha * Math.PI / 180.0);

    return mat4( 
        [1, 0, -l * cosa, 0],
        [0, 1, -l * sina, 0],
        [0, 0, -1, 0],
        [0, 0, 0, 1])
}

function render() {

    mView = mat4();

    var projection = ortho(-aspect,aspect, -aspect, aspect,-10,10);

    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw stored primitives
    if(instances!=undefined){
        let p = instances.p;

        gl.uniformMatrix4fv(mModelLoc, false, flatten(instances.t));
        p(gl, program);
    }


    modelView = lookAt([0,0,0], [0,0,0], [0,1,0]);
    window.requestAnimationFrame(render);
}
