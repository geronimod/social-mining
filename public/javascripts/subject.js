// subject attributes:
//   :origin, :destiny, :start_at, :end_at, :reason, :date, :transport, 
//   :name, :sex, :activity, :educaction, :age 
        
function Subject(options) {   
  // Current position
  this.x = 0;
  this.y = 0;
  
  // Target
  this.tx = 0;
  this.ty = 0;
  
  // Deltas
  this.dx = 0;
  this.dy = 0;
  
  // Velocity
  this.v = 3;
  
  // WayPoints alone the road from Start to Target.
  this.wps = [];
  
  // Index of current waypoint.
  this.wp_index = 0;

  // State
  this.idle = false;
  
  this.color = "#ff0000";
  
  this.attributes = null;
  
  this.direction = 1;
  
  for(k in options) {
    this[k] = options[k];
  };
  
  // Feature
  this.f = new OpenLayers.Feature.Vector(
    new OpenLayers.Geometry.Point(this.y, this.x),
    { id: '', color: this.color, pointRadius: "1" }
  );
  
  this.f.agent = this;
  
  this.setStart = function(p) {
    this.x = p[0];
    this.y = p[1];
  };

  this.setTarget = function(p) {
    this.tx = p[0];
    this.ty = p[1];
  };

  this.setWayPoints = function(wps) {
    this.wps = wps;
    this.setStart(this.wps[0]);
    this.setTarget(this.wps[1]);
    this.wp_index = 1;
  };
  
  this.onmove = function(a, o, d){};
  
  this.update = function() {
    var dx = 0;
    var dy = 0;
    
    if(!this.idle) {
      var d = Math.sqrt(Math.pow((this.tx - this.x),2) + Math.pow((this.ty - this.y),2)) + 0.1;
       
      if (d > this.v) {
        dx = this.v*(this.tx - this.x)/d;
        dy = this.v*(this.ty - this.y)/d;
      
      } else {

        if (this.wp_index == this.wps.length - 1) {
          this.direction = -1;
        }

        if(this.wp_index == 0) {
          this.direction = 1;
        }

        this.wp_index = this.wp_index + this.direction;
        this.setTarget(this.wps[this.wp_index]);
      }
       
      // Normalize velocity to agents speed
      var lengthv = Math.sqrt(dx*dx + dy*dy) + 0.1;
      dx = this.v*dx/lengthv;
      dy = this.v*dy/lengthv;
      
      origin = {};
      origin.x = this.x;
      origin.y = this.y;
      
      this.x += dx;
      this.y += dy;
      
      destination = {};
      destination.x = this.x;
      destination.y = this.y;
      
      this.dx = dx;
      this.dy = dy;
      
      if (this.f.layer.visibility) {
        this.f.move(new OpenLayers.LonLat(this.y, this.x));
      }
      
      this.onmove(this, origin, destination);
    }
  };
}