var parabolic_points = [];
var parabolic_normals = [];
var parabolic_faces = [];
var parabolic_edges = [];

var parabolic_points_buffer;
var parabolic_normals_buffer;
var parabolic_faces_buffer;
var parabolic_edges_buffer;

var PARABOLIC_LATS=20;
var PARABOLIC_LONS=30;

function parabolicInit(gl, nlat, nlon) {
    nlat = nlat | PARABOLIC_LATS;
    nlon = nlon | PARABOLIC_LONS;
    parabolicBuild(nlat, nlon);
    parabolicUploadData(gl);
}

// Generate points using polar coordinates
function parabolicBuild(nlat, nlon) 
{
    // phi will be latitude
    // theta will be longitude
 
    var d_phi = Math.PI / (2*(nlat+1));
    var d_theta =  2*(Math.PI / nlon);
    var r = 0.5;
    
    // Generate north polar cap
    var north = vec3(0,r,0);
    parabolic_points.push(north);
    parabolic_normals.push(vec3(0,1,0));
    // Generate middle
    for(var i=0, phi=Math.PI/2-d_phi; i<nlat; i++, phi-=d_phi) {
        var tmp=phi*(1/3);
        for(var j=0, theta=0; j<nlon; j++, theta+=d_theta) {
            var pt = vec3(tmp*phi*Math.cos(theta),phi*tmp*tmp,tmp*3*phi*Math.sin(theta));
            parabolic_points.push(pt);
            var n = vec3(pt);
            parabolic_normals.push(normalize(n));
        }
    }

    // general middle faces
    var offset=1;
    
    for(var i=0; i<nlat-1; i++) {
        for(var j=0; j<nlon-1; j++) {
            var p = offset+i*nlon+j;
            parabolic_faces.push(p);
            parabolic_faces.push(p+nlon+1);
            parabolic_faces.push(p+nlon);
            
            parabolic_faces.push(p);
            parabolic_faces.push(p+1);
            parabolic_faces.push(p+nlon+1);
        }
        var p = offset+i*nlon+nlon-1;
        parabolic_faces.push(p);
        parabolic_faces.push(p+1);
        parabolic_faces.push(p+nlon);

        parabolic_faces.push(p);
        parabolic_faces.push(p-nlon+1);
        parabolic_faces.push(p+1);
    }

    for(var i=0; i<nlat; i++, p++) {
        for(var j=0; j<nlon;j++, p++) {
            var p = 1 + i*nlon + j;
            parabolic_edges.push(p);   // horizontal line (same latitude)
            if(j!=nlon-1) 
                parabolic_edges.push(p+1);
            else parabolic_edges.push(p+1-nlon);
            
            if(i!=nlat-1) {
                parabolic_edges.push(p);   // vertical line (same longitude)
                parabolic_edges.push(p+nlon);
            }
            else {
                parabolic_edges.push(p);
                parabolic_edges.push(parabolic_points.length-1);
            }
        }
    }
    
}

function parabolicUploadData(gl)
{
    parabolic_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(parabolic_points), gl.STATIC_DRAW);
    
    parabolic_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(parabolic_normals), gl.STATIC_DRAW);
    
    parabolic_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parabolic_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parabolic_faces), gl.STATIC_DRAW);
    
    parabolic_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parabolic_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(parabolic_edges), gl.STATIC_DRAW);
}

function parabolicDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parabolic_edges_buffer);
    gl.drawElements(gl.LINES, parabolic_edges.length, gl.UNSIGNED_SHORT, 0);
}

function parabolicDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, parabolic_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, parabolic_faces_buffer);
    gl.drawElements(gl.TRIANGLES, parabolic_faces.length, gl.UNSIGNED_SHORT, 0);
}

function parabolicDraw(gl, program, filled=false) {
	if(filled) parabolicDrawFilled(gl, program);
	else parabolicDrawWireFrame(gl, program);
}