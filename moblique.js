var gl, program;

const CUBE=0,SPHERE=1,CYLINDER=2, TORUS=3, PARABOLIC=4;
const WIRED=0;
const NOT_WIRED=1;
var instances;
var mode=WIRED;
var primitive=CUBE;

var mModelLoc;
var mView,mProjection;
var mNormals, mViewNormals,shininess=6;
var lightAmb = vec3(0.5, 0.2, 0.2), lightDif = vec3(0.7, 0.7, 0.7), lightSpe = vec3(0.1, 0.2, 1.0), lightPos = vec4(0,2,2,0);
var materialAmb = vec3(1.0, 1.0, 1.0);
var materialDif = vec3(1.0, 1.0, 1.0);
var materialSpe = vec3(1.0, 0.1, 0.4);

var lightOff=0;

var eye;
var at;
var up;


var zbuffer=false,backCulling=false;

var aspect = 2;

var alpha = 45, l=1;

var mine=1;

var ga=0.5,te=0.5;

var drag = false;

var angleX=0, angleY=0;
var oldX,oldY;


var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame, cylinderDrawWireFrame, torusDrawWireFrame, parabolicDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled, cylinderDrawFilled, torusDrawFilled, parabolicDrawFilled]
];


function locs(){
    mModelLoc = gl.getUniformLocation(program, "mModel");
    mviewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    mViewNormalsLoc = gl.getUniformLocation(program, "mViewNormals");
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");
    shininessLoc = gl.getUniformLocation(program, "fzshininess");
    lightAmbLoc = gl.getUniformLocation(program, "lightAmb");
    lightDifLoc = gl.getUniformLocation(program, "lightDif");
    lightSpeLoc = gl.getUniformLocation(program, "lightSpe");
    materialAmbLoc = gl.getUniformLocation(program, "materialAmb");
    materialDifLoc = gl.getUniformLocation(program, "materialDif");
    materialSpeLoc = gl.getUniformLocation(program, "materialSpe");
    lightPosLoc = gl.getUniformLocation(program, "lightPosition");
    lightOffLoc = gl.getUniformLocation(program, "lightOff");


    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    parabolicInit(gl);
}


function drawOnClick(){

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

    document.getElementById("reset_all").onclick=function() {
        primitive=0;
        instances = undefined;  
        axonometrica(42,7);     
        $("input:radio").removeAttr("checked");
        $(".axonometrica").hide();
        $(".ortogonal").hide();
        shininess=6;
        lightAmb = vec3(0.5, 0.2, 0.2); 
        lightDif = vec3(0.7, 0.7, 0.7);
        lightSpe = vec3(0.1, 0.2, 1.0);
        lightPos = vec4(0,2,2,0);
        materialAmb = vec3(1.0, 1.0, 1.0);
        materialDif = vec3(1.0, 1.0, 1.0);
        materialSpe = vec3(1.0, 0.1, 0.4);

        document.getElementById("shininess").value = 6;
        document.getElementById("lightAmb1").value = 50;
        document.getElementById("lightAmb2").value = 20;
        document.getElementById("lightAmb3").value =20;
        document.getElementById("lightDif1").value =70;
        document.getElementById("lightDif2").value =70;
        document.getElementById("lightDif3").value =70;
        document.getElementById("lightSpe1").value =10;
        document.getElementById("lightSpe2").value =20;
        document.getElementById("lightSpe3").value =100;
        document.getElementById("materialAmb1").value =100;
        document.getElementById("materialAmb2").value =100;
        document.getElementById("materialAmb3").value =100;
        document.getElementById("materialDif1").value =100;
        document.getElementById("materialDif2").value =100;
        document.getElementById("materialDif3").value =100;
        document.getElementById("materialSpe1").value =100;
        document.getElementById("materialSpe2").value =10;
        document.getElementById("materialSpe3").value = 40;
        document.getElementById("lightPos1").value =0;
        document.getElementById("lightPos2").value =20;
        document.getElementById("lightPos3").value =20;
    
    };
}


function principal(){
    eye = [0,0,0];
    at = [0,0,0]; 
    up = [0,1,0];  
}

function planta(){
    eye = [0,1,0];
        at = [0,0,0];
        up = [0,0,1]; 
}

function direito(){
    eye = [1,0,0];
    at = [0,0,0];
    up = [0,1,0]; 
}

function ortogonal(){
    document.getElementById("principal").onclick=function() {  
        principal();  
    };

    document.getElementById("planta").onclick=function() {  
        planta(); 
    };

    document.getElementById("direito").onclick=function() {  
        direito();
    };
}


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

    locs();


    gl.canvas.onmousedown = mousedown;
    gl.canvas.onmouseup = mouseup;
    gl.canvas.onmousemove = mousemove;

    drawOnClick();

    axonometrica(42,7);


    ortogonal();



    document.getElementById("switch").onchange=function() {
        if(lightPos[3])
            lightPos[3] = 0;
        else
            lightPos[3] = 1;
    };

    document.getElementById("isometrica").onclick=function() {
        axonometrica(30,30);
    };

    document.getElementById("dimetrica").onclick=function() {
        axonometrica(42,7);
    };
   
    document.getElementById("trimetrica").onclick=function() {
        axonometrica(54+(16/60),23+(16/60));
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

    document.getElementById("shininess").oninput =function() {
        shininess = this.value;
    };

    document.getElementById("lightAmb1").oninput =function() {
        lightAmb[0] = this.value/100;
    };

    document.getElementById("lightAmb2").oninput =function() {
        lightAmb[1] = this.value/100;
    };

    document.getElementById("lightAmb3").oninput =function() {
        lightAmb[2] = this.value/100;
    };

    document.getElementById("lightDif1").oninput =function() {
        lightDif[0] = this.value/100;
    };

    document.getElementById("lightDif2").oninput =function() {
        lightDif[1] = this.value/100;
    };

    document.getElementById("lightDif3").oninput =function() {
        lightDif[2] = this.value/100;
    };

    document.getElementById("lightSpe1").oninput =function() {
        lightSpe[0] = this.value/100;
    };

    document.getElementById("lightSpe2").oninput =function() {
        lightSpe[1] = this.value/100;
    };

    document.getElementById("lightSpe3").oninput =function() {
        lightSpe[2] = this.value/100;
    };



    document.getElementById("materialAmb1").oninput =function() {
        lightAmb[0] = this.value/100;
    };

    document.getElementById("materialAmb2").oninput =function() {
        lightAmb[1] = this.value/100;
    };

    document.getElementById("materialAmb3").oninput =function() {
        lightAmb[2] = this.value/100;
    };

    document.getElementById("materialDif1").oninput =function() {
        lightDif[0] = this.value/100;
    };

    document.getElementById("materialDif2").oninput =function() {
        lightDif[1] = this.value/100;
    };

    document.getElementById("materialDif3").oninput =function() {
        lightDif[2] = this.value/100;
    };

    document.getElementById("materialSpe1").oninput =function() {
        lightSpe[0] = this.value/100;
    };

    document.getElementById("materialSpe2").oninput =function() {
        lightSpe[1] = this.value/100;
    };

    document.getElementById("materialSpe3").oninput =function() {
        lightSpe[2] = this.value/100;
    };

    document.getElementById("lightPos1").oninput =function() {
        lightPos[0] = this.value/10;
    };

    document.getElementById("lightPos2").oninput =function() {
        lightPos[1] = this.value/10;
    };

    document.getElementById("lightPos3").oninput =function() {
        lightPos[2] = this.value/10;
    };


    document.getElementById("perspetiva").onclick=function() {
        eye = [1,0,0];
        at = [0,0,0];
        up = [0,0,1/9.9]; 
    };

    $("[value='ortogonal'").click(function() {
        $(".axonometrica").hide();
        $(".ortogonal").show();
        if ($('#principal').is(":checked")) 
            principal();
        else if ($('#planta').is(":checked")) 
           planta();
        else if ($('#direito').is(":checked")) 
            direito();
    });

    $("[value='axonometrica'").click(function() {
        $(".ortogonal").hide();
        $(".axonometrica").show();
        if ($('#isometrica').is(":checked")) 
            axonometrica(30,30);
        else if ($('#dimetrica').is(":checked")) 
            axonometrica(42,7);
        else if ($('#trimetrica').is(":checked")) 
            axonometrica(54+(16/60),23+(16/60));
    });

    $("[value='perspetiva'").click(function() {
        $(".ortogonal").hide();
        $(".axonometrica").hide();
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
            case 'l':
                if(lightOff)
                    lightOff=0;
                else
                    lightOff=1;
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


function axonometrica(f,s){
    var A = radians(f);
    var B = radians(s);


    var gama= Math.asin(Math.sqrt(Math.tan(A)*Math.tan(B)));
    var teta= Math.atan(Math.sqrt(Math.tan(A)/Math.tan(B))) - (Math.PI/2);

    var cg = Math.cos(gama);
    var ct = Math.cos(teta);
    var sg = Math.sin(gama);
    var st = Math.sin(teta);


    eye=vec3(-cg*st, sg, cg*ct);
    at = vec3(0.0, 0.0,0.0);
    up=vec3(st*sg, cg, -ct*sg);
}

function livre(gama,teta){
    var cg = Math.cos(gama);
    var ct = Math.cos(teta);
    var sg = Math.sin(gama);
    var st = Math.sin(teta);

    eye=vec3(-cg*st, sg, cg*ct);
    at = vec3(0.0, 0.0,0.0);
    up=vec3(st*sg, cg, -ct*sg);
}




function mousedown(event) {
    oldX = event.clientX;
    oldY = event.clientY;
    var rect = event.target.getBoundingClientRect();
    // If we're within the rectangle, mouse is down within canvas.
    if (rect.left <= oldX && oldX < rect.right && rect.top <= oldY && oldY < rect.bottom) {
        event.clientX = oldX;
        event.clientY = oldY;
        drag = true;
    }
  }

  function mouseup(event) {
    drag = false;
  }

  function mousemove(event) {
    if (drag) {
      // The rotation speed factor
      // dx and dy here are how for in the x or y direction the mouse moved
      angleX += 0.1 * (event.clientX - oldX);
      angleY += 0.1 *  (event.clientY - oldY);

      // update the latest angle
      angleX = Math.max(angleX, -Math.PI / 2 + 0.01);
      angleY = Math.min(angleY, Math.PI / 2 - 0.01);


        oldX = event.clientX;
        oldY = event.clientY;
    }
  }




function uniforms(){
    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
    gl.uniformMatrix4fv(mViewNormalsLoc, false, flatten(mViewNormals));
    gl.uniform1f(shininessLoc, shininess);
    gl.uniform1f(lightOffLoc, lightOff);
    gl.uniform3fv(lightAmbLoc, lightAmb);
    gl.uniform3fv(lightDifLoc, lightDif);
    gl.uniform3fv(lightSpeLoc, lightSpe);
    gl.uniform4fv(lightPosLoc, lightPos);
    gl.uniform3fv(materialAmbLoc, materialAmb);
    gl.uniform3fv(materialDifLoc, materialDif);
    gl.uniform3fv(materialSpeLoc, materialSpe);
}

function render() {

    drawPrimitive(primitive);


    mView = lookAt(eye, at, up);
    mProjection = ortho(-aspect,aspect, -aspect, aspect,-10,10);

    if (!$('#perspetiva').is(":checked")) 
        mProjection = ortho(-aspect,aspect, -aspect, aspect,-10,10);
    else{
        mProjection = perspective(150,1,0.1,10);
        mView = mult(mult(mView,rotateX(angleX)),rotateZ(angleY));
    }

    mNormals = normalMatrix(mult(instances.t,mView),false);
    mViewNormals = normalMatrix(mult(instances.t,mView),false);

    uniforms();


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw stored primitives
    let p = instances.p;
    gl.uniformMatrix4fv(mModelLoc, false, flatten(instances.t));
    p(gl, program);

    window.requestAnimationFrame(render);
}
