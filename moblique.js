var gl, program;

const CUBE=0,SPHERE=1,CYLINDER=2, TORUS=3, PARABOLIC=4;
const WIRED=0;
const NOT_WIRED=1;
var instances;
var mode=WIRED;
var primitive=CUBE;

var mModelLoc;
var mView,mProjection;
var mNormals, mViewNormals;

var eye;
var at;
var up;

var zbuffer=false,backCulling=false;

var aspect = 2;

var alpha = 45, l=1;

var mine=1;

var ga=0.5,te=0.5;

var drag = false;

var angleX=1,angleY=1;

//var perspective = "o";

var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame, cylinderDrawWireFrame, torusDrawWireFrame, parabolicDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled, cylinderDrawFilled, torusDrawFilled, parabolicDrawFilled]
];

window.onload = function() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);

    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mviewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    mViewNormalsLoc = gl.getUniformLocation(program, "mViewNormals");
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");


    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    parabolicInit(gl);


    gl.canvas.onmousedown = mousedown;
    gl.canvas.onmouseup = mouseup;
    gl.canvas.onmousemove = mousemove;


    document.getElementById("new_cube").onclick=function() {
        primitive = CUBE;
    };

    document.getElementById("new_sphere").onclick=function() {
        primitive = SPHERE;
    };

    document.getElementById("new_cylinder").onclick=function() {
        primitive = CYLINDER;
    };

    document.getElementById("new_torus").onclick=function() {
        primitive = TORUS;
    };

    document.getElementById("new_parabolic").onclick=function() {
        primitive = PARABOLIC;
    };

    axonometrica(radians(42),radians(7));

    document.getElementById("reset_all").onclick=function() {
        primitive=0;
        instances = undefined;  
        axonometrica(radians(42),radians(7));     
    };


    document.getElementById("principal").onclick=function() {  
        eye = [0,0,0];
        at = [0,0,0]; 
        up = [0,1,0];  
    };

    document.getElementById("planta").onclick=function() {  
        eye = [0,1,0];
        at = [0,0,0];
        up = [0,0,1]; 
    };

    document.getElementById("direito").onclick=function() {  
        eye = [1,0,0];
        at = [0,0,0];
        up = [0,0,1]; 
    };


    document.getElementById("isometrica").onclick=function() {
        axonometrica(radians(30),radians(30));
    };

    document.getElementById("dimetrica").onclick=function() {
        axonometrica(radians(42),radians(7));
    };
   
    document.getElementById("trimetrica").onclick=function() {
        axonometrica(radians(54+(16/60)),radians(23+(16/60)));
    };
    
    document.getElementById("livre").onclick=function() {
        livre(ga,te);
    };

    document.getElementById("theta").oninput =function() {
        te = this.value/100;
        livre(ga,te);
    };

    document.getElementById("gamma").oninput =function() {
        ga = this.value/100;
        livre(ga,te);
    };


    document.getElementById("perspetiva").onclick=function() {
        eye = [1,0,0];
        at = [0,0,0];
        up = [0,0,1/9.9]; 
    };

    $("[value='ortogonal'").click(function() {
        $(".axonometrica").hide()
        $(".ortogonal").show()
    });

    $("[value='axonometrica'").click(function() {
        $(".ortogonal").hide()
        $(".axonometrica").show()
    });

    $("[value='perspetiva'").click(function() {
        $(".ortogonal").hide()
        $(".axonometrica").hide()
    });

    $('input[name=ax]').change(function(){
        if (!$('#livre').is(":checked")) 
            $('.slidecontainer').css('display','none');
        else 
            $('.slidecontainer').css('display','block');
    });


    document.onkeydown = function(event) {
        switch(event.key) {
            case 'w':
                mode = WIRED;
                break;     
            case 'f':
                mode = NOT_WIRED;
                break;
            case 'z':
                if(!zbuffer){
                    gl.enable(gl.DEPTH_TEST);
                    zbuffer=true;
                }
                else{
                    gl.disable(gl.DEPTH_TEST);
                    zbuffer=false;
                }
                break;
            case 'b':
                if(!backCulling){
                    gl.enable(gl.CULL_FACE);
                    backCulling=true;
                }
                else{
                    gl.disable(gl.CULL_FACE);
                    backCulling=false;
                }
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



    render();
}

function drawPrimitive(primitive){
    instances = {t: mat4(), p: drawFuncs[mode][primitive]};
}


function axonometrica(A,B){
    var teta= Math.atan(Math.sqrt(Math.tan(A)/Math.tan(B))) - (Math.PI/2);
    var gama= Math.asin(Math.sqrt(Math.tan(A)*Math.tan(B)));

    //RX
    var c = Math.cos(gama);
    var s = Math.sin( gama);
    //RY
    var g = Math.cos(teta);
    var o = Math.sin(teta);

    /*
    var final=  mat4( -c*o, s, c*g, 0.0,
        0.0, 0.0,  0.0, 0.0,
        o*s, c,  -g*s, 0.0,
        0.0, 0.0,  0.0, 1.0 )
    ;
        */

    eye=vec3(-c*o, s, c*g);
    at = vec3(0.0, 0.0,0.0);
    up=vec3(o*s, c, -g*s);
}

function livre(gama,teta){
    var A= radians(30);
    var B= radians(30);
    //var teta= Math.atan(Math.sqrt(Math.tan(A)/Math.tan(B))) - (Math.PI/2);
    //var gama= Math.asin(Math.sqrt(Math.tan(A)*Math.tan(B)));

    //RX
    var c = Math.cos(gama);
    var s = Math.sin(gama);
    //RY
    var g = Math.cos(teta);
    var o = Math.sin(teta);

    var final=  mat4( -c*o, s, c*g, 0.0,
        0.0, 0.0,  0.0, 0.0,
        o*s, c,  -g*s, 0.0,
        0.0, 0.0,  0.0, 1.0 )
    ;

    //mView=lookAt(vec3(-c*o, s, c*g),vec3(0.0, 0.0,0.0),vec3(o*s, c, -g*s));
    eye=vec3(-c*o, s, c*g);
    at = vec3(0.0, 0.0,0.0);
    up=vec3(o*s, c, -g*s);
}




function mousedown(event) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    // If we're within the rectangle, mouse is down within canvas.
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        event.clientX = x;
        event.clientY = y;
        drag = true;
    }
    console.log(instances.t);
  }

  function mouseup(event) {
    drag = false;
  }

  function mousemove(event) {
    var x = event.clientX;
    var y = event.clientY;
    if (drag) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      var factor = 10/gl.canvas.height;
      var dx = factor * (x - event.clientX);
      var dy = factor * (y - event.clientY);

      // update the latest angle
      angleX = angleX + dy;
      angleY = angleY + dx;
    }
    // update the last mouse position
    event.clientX = x;
    event.clientY = y;

  }


function render() {

    drawPrimitive(primitive);
  

    mView = lookAt(eye, at, up);
    mProjection = ortho(-aspect,aspect, -aspect, aspect,-10,10);

    if (!$('#perspetiva').is(":checked")) 
        mProjection = ortho(-aspect,aspect, -aspect, aspect,-10,10);
    else 
        mProjection = perspective(2*Math.atan(1/2)*(180/Math.PI),1,0.1,10);

    mNormals = transpose(mult(instances.t,mView));
    //mViewNormals = transpose(mult(instances.t,mView));

    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
    //gl.uniformMatrix4fv(mViewNormalsLoc, false, flatten(mViewNormals));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw stored primitives
    let p = instances.p;
    gl.uniformMatrix4fv(mModelLoc, false, flatten(instances.t));
    p(gl, program);

    window.requestAnimationFrame(render);
}
