var gl, program;

var instances;

var modelView;
var mModelLoc;
var mView, mProjection;

var alpha = 45, l=1;

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
        instances = {t: mat4(), p: cubeDrawWireFrame};

    document.getElementById("new_cube").onclick=function() {
        instances = {t: mat4(), p: cubeDrawWireFrame};
    };

    document.getElementById("new_sphere").onclick=function() {
        instances = {t: mat4(), p: sphereDrawWireFrame};
    };

    document.getElementById("new_cylinder").onclick=function() {
        instances = {t: mat4(), p: cylinderDrawWireFrame};
    };

    document.getElementById("new_torus").onclick=function() {
        instances = {t: mat4(), p: torusDrawWireFrame};
    };

    document.getElementById("reset_all").onclick=function() {
        instances = undefined;
    };

    //document.getElementById("l").oninput = update_oblique;
    //document.getElementById("alpha").oninput = update_oblique;
    drawPrimitive(0, 1, program);
    render();
}

var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled]
];

function drawPrimitive(obj, mode, program) {
    //gl.uniformMatrix4fv(mModelLoc, false, flatten(modelView));
    //gl.uniformMatrix4fv(mviewLoc, false, flatten(modelView));
    drawFuncs[mode][obj](gl, program);
}


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
    mProjection = buildMobl(l, alpha);

    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

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
