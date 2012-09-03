function anagent()
{
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
    this.v = 1.5;
    
    // WayPoints alone the road from Start to Target.
    this.wps = [];
    
    // Index of current waypoint.
    this.wp_index = 0;

    // State
    this.idle = false;
    
    this.f = null;

    this.setStart = function(p)
    {
        this.x = p[0];
        this.y = p[1];
    };

    this.setTarget = function(p)
    {
        this.tx = p[0];
        this.ty = p[1];
    };

    this.setWayPoints = function(wps)
    {
        this.wps = wps;
        this.setStart(this.wps[0]);
        this.setTarget(this.wps[1]);
        this.wp_index = 1;
    };
}