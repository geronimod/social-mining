// Globals
var g_map;
var g_layer_mapnik;
var g_agent_layer;

// How should features be drawn on the maps? Red, Green, Blue, label=''?
var g_style_map = new OpenLayers.StyleMap 
({'default':
{
  fillColor: "${color}",
  strokeColor: "${color}",
  strokeWidth: 1,
  pointRadius: "${pointRadius}",
  pointerEvents: "visiblePainted",
  fillOpacity: 0.4,
  label: "${id}",
  fontColor: "${color}",
  fontSize: "${fontSize}",
  fontFamily: "Courier New, monospace",
  fontWeight: "bold",
  labelXOffset: "0",
  labelYOffset: "${yOff}"
}
});

// How fast should the game be updated.
var g_update_interval = 1;

var g_playing = false;
var agents = [];

// Defaults from simple_crowd.py
var POT_EXTEND = 10
var POT_DECAY = 0.6 //0.027
var POT_STRENGTH = 300 //350   

// return total danger due to all agents from position x, y
function totalDangerAt(x, y)
{
    var danger = 0;
    
    for(var i=0; i<agents.length; i++)
    {
        var a = agents[i];
        danger += dangerDue(x, y, a);
    }
    
    return danger;
}

// return danger to an agent a from position x, y
function dangerDue(x, y, a)
{
    var px2 = a.x + POT_EXTEND * a.dx;
    var py2 = a.y + POT_EXTEND * a.dy;
    var d1 = Math.sqrt(Math.pow((a.x - x), 2) + Math.pow((a.y - y), 2));
    var d2 = Math.sqrt(Math.pow((px2 - x), 2) + Math.pow((py2 - y), 2));
    var danger = Math.pow(Math.E, (-POT_DECAY*(d1 + d2)));
    
    return danger;
}

// return the gradient of danger at position x, y due to agent a
function gradDangerDue(x, y, a)
{
    var px2 = a.x + POT_EXTEND*a.dx;
    var py2 = a.y + POT_EXTEND*a.dy;
    var d1 = Math.sqrt(Math.pow((a.x - x),2) + Math.pow((a.y - y),2));
    var d2 = Math.sqrt(Math.pow((px2 - x),2) + Math.pow((py2 - y),2));
    var danger = Math.pow(Math.E,(-POT_DECAY*(d1 + d2)));
    
    var multiplierx = -POT_DECAY*(x - a.x)/(2*d1) - POT_DECAY*(x - px2)/(2*d2);
    var multipliery = -POT_DECAY*(y - a.y)/(2*d1) - POT_DECAY*(y - py2)/(2*d2);
    
    return [danger*multiplierx, danger*multipliery];
}

// return the total gradient of danger at position x, y due to all agents
function gradDangerAt(x, y)
{
    var totx = 0
    var toty = 0
    
    for(var i=0; i<agents.length; i++)
    {
        var a = agents[i];
        
        if(a.x != x && a.y != y)
        {
            var res = gradDangerDue(x, y, a);
            
            totx += res[0];
            toty += res[1];
        }
    }
    
    return [totx, toty];
}

var sleep_Eng2Bridge = false;
var iter_Eng2Bridge = 0;
function Controller_Eng2Bridge()
{
    // Engineers
    // Every 50 updates stop creating new Eng agents for a random amount of time (max 10 seconds).
    if(iter_Eng2Bridge == 50 && !sleep_Eng2Bridge)
    {
        sleep_Eng2Bridge = true;

        var sleep_time = Math.random() * (1000 * 10);
        setTimeout("sleep_Eng2Bridge = false;iter_Eng2Bridge=0;", sleep_time);
    }

    // Only generate agents if not sleeping for a random amount of time.
    if(!sleep_Eng2Bridge)
    {
        n1 = myRandom(3);
        for(var i = 0; i < Math.floor(n1); i ++)
            GenerateAgent_Eng2Bridge();

        iter_Eng2Bridge ++;
    }
}

var sleep_Arts2Hume = false;
var iter_Arts2Hume = 0;
function Controller_Arts2Hume()
{
    // Every 25 updates stop creating new Arts2Hume agents for a random amount of time (max 10 seconds).
    if(iter_Arts2Hume == 25 && !sleep_Arts2Hume)
    {
        sleep_Arts2Hume = true;

        var sleep_time = Math.random() * (1000 * 10);
        setTimeout("sleep_Arts2Hume = false;iter_Arts2Hume=0;", sleep_time);
    }

    // Only generate Arts2Hume agents if not sleeping for a random amount of time.
    if(!sleep_Arts2Hume)
    {
        n1 = myRandom(3);
        for(var i = 0; i < Math.floor(n1); i ++)
            GenerateAgent_Arts2Hume();

        iter_Arts2Hume ++;
    }
}

var sleep_Iontas2Bridge = false;
var iter_Iontas2Bridge = 0;
function Controller_Iontas2Bridge()
{
    // Iontas-eers
    // Every 40 updates stop creating new Iontas agents for a random amount of time (max 10 seconds).
    if(iter_Iontas2Bridge == 40 && !sleep_Iontas2Bridge)
    {
        sleep_Iontas2Bridge = true;

        var sleep_time = Math.random() * (1000 * 10);
        setTimeout("sleep_Iontas2Bridge = false;iter_Iontas2Bridge=0;", sleep_time);
    }

    // Only generate Iontas agents if not sleeping for a random amount of time.
    if(!sleep_Iontas2Bridge)
    {
        n1 = myRandom(3);
        for(var i = 0; i < Math.floor(n1); i ++)
            GenerateAgent_Iontas2Bridge();

        iter_Iontas2Bridge ++;
    }
}

function update()
{
    if(g_agent_layer.features.length < 150)
    {
        // The below controller functions decided when and how often to create agents of each type.
        Controller_Arts2Hume();
        Controller_Eng2Bridge();
        Controller_Iontas2Bridge();
    }
    
    // FW Edit
    canvasData = ctx.getImageData(0, 0, surface_layer.canvas.width, surface_layer.canvas.height);
    for(var i=3; i < canvasData.data.length; i+=4)
    {
        if(canvasData.data[i] > 0)
        {
            canvasData.data[i] -= canvasData.data[i]/100;
            canvasData.data[i-3] -= canvasData.data[i-3]/50;
            canvasData.data[i-1] += canvasData.data[i-3]/50;
        }
    }
    ctx.putImageData(canvasData, 0, 0);
    //ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
    //ctx.fillRect (0, 0, surface_layer.canvas.width, surface_layer.canvas.height); 
    
    // Update all agents.
    for(var i = 0; i < agents.length; i++)
    {
        var a = agents[i];
        
        var dx = 0;
        var dy = 0;
        
        if(!a.idle)
        {
           var d = Math.sqrt(Math.pow((a.tx - a.x), 2) + Math.pow((a.ty - a.y),2)) + 0.1;
           
           if(d > a.v)
           {
               dx = a.v*(a.tx - a.x)/d;
               dy = a.v*(a.ty - a.y)/d;
           }
           
           else
           {
                if(a.wp_index == a.wps.length - 1)
                {
                    agents.splice(i, 1);
                    g_agent_layer.removeFeatures([g_agent_layer.features[i]]);
                    
                    if(a.type == "roost")
                    {
                        g_obstacle_layer.removeFeatures([g_obstacle_layer.features[0]]);
                        var roost_counter = new OpenLayers.Feature.Vector
                        (
                            new OpenLayers.Geometry.Point(-733830.95273754, 7053760.6285066),
                            {id: '', color: "#0000FF", pointRadius: "1", fontSize: "20"}
                        );
                        g_obstacle_layer.addFeatures(roost_counter);
                    }

                    continue;
                }

                a.wp_index = a.wp_index + 1;
                a.setTarget(a.wps[a.wp_index]);
           }
       
           // now calculate force due to poptential at this point.
           // we do this by summing up all the gradients at this point
           // of all functions that each agent generates.
           var grad = gradDangerAt(a.x, a.y);
           var gradx = grad[0];
           var grady = grad[1];
           gradx = -gradx*POT_STRENGTH
           grady = -grady*POT_STRENGTH
           
           dx += gradx;
           dy += grady;
           
           // Normalize velocity to agents speed
           var lengthv = Math.sqrt(dx*dx + dy*dy) + 0.1;
           dx = a.v*dx/lengthv;
           dy = a.v*dy/lengthv;
           
           pixel1 = surface_layer.geoToPixel(a.x,a.y);
           
           a.x += dx;
           a.y += dy;
           a.dx = dx;
           a.dy = dy;
           a.f.move
           (
                new OpenLayers.LonLat
                (
                    a.x,
                    a.y
                )
           );
            
            pixel = surface_layer.geoToPixel(a.x,a.y);
            //p = surface_layer.map.getLayerPxFromLonLat(new OpenLayers.LonLat(a.x, a.y));
            //pixel = [p.x, p.y];
            // var idx = (pixel[0] + pixel[1] * surface_layer.canvas.width) * 4;
            // canvasData.data[idx + 0] = 0;
            // canvasData.data[idx + 1] = 0;
            // canvasData.data[idx + 2] = 255;
            // canvasData.data[idx + 3] += 100;
            
            c = [250, 20, 20]
            ctx.strokeStyle = "rgba("+ c[0] + ", "+c[1]+", "+c[2]+", 0.1)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pixel1[0], pixel1[1]);
            ctx.lineTo(pixel[0], pixel[1]);
            ctx.stroke();
        }
    }
    //ctx.putImageData(canvasData, 0, 0);
    //surface_layer.tile.imgDiv.src = canvas.toDataURL();
    
    if(g_playing)
        setTimeout("update();", g_update_interval);
}

function button_clicked()
{
    var button = document.getElementById('button_play_pause');
    
    if(g_playing)
    {
        console.log("playing");
        g_playing = !g_playing;
        button.innerHTML = "<b>Play</b>";
    }
    
    else
    {
        console.log("not playing");
        g_playing = !g_playing;
        button.innerHTML = "<b>Pause</b>";
        
        update();
    }

    console.log("clicked2");
}

function myRandom(abs_maximum)
{
    var rand = Math.random()*abs_maximum;
    
    if(Math.random() > 0.45)
        rand = 1 - rand;

    return rand;
}

function GenerateAgent_Eng2Bridge()
{
    var agent = new anagent();
    agent.setWayPoints
    ([
        [-734985.00107209, 7054419.3007124],
        [-734978.43226497, 7054398.3999625],
        [-734894.2321010166, 7054438.4099695],
        [-734838.09865838, 7054415.7177267],
        [-734771.81342293, 7054270.6068058],
        [-734705.52818747, 7054240.7485917],
        [-734648.20041627, 7054123.1072279]
    ]);

    ToTheOldPubInstead(agent);

    var f = new OpenLayers.Feature.Vector
    (
        new OpenLayers.Geometry.Point(agent.x, agent.y),
        {id: '', color: "#FF6600", pointRadius: "1"}
    );
    g_agent_layer.addFeatures(f);
    agent.f = f;

    agents.push(agent);
}

function GenerateAgent_Arts2Hume()
{
    var abs_max = 3;

    var agent = new anagent();
    agent.setWayPoints
    ([
        [-734829.14119413 + myRandom(abs_max), 7054319.5742771 + myRandom(abs_max)],
        [-734803.46312995 + myRandom(abs_max), 7054334.5033842 + myRandom(abs_max)], 
        [-734790.32551571 + myRandom(abs_max * 2), 7054326.1430842 + myRandom(abs_max * 2)], 
        [-734757.48148013 + myRandom(abs_max), 7054336.294877 + myRandom(abs_max)],
        [-734741.95520876 + myRandom(abs_max), 7054353.015477 + myRandom(abs_max)]
    ]);

    var f = new OpenLayers.Feature.Vector
    (
        new OpenLayers.Geometry.Point(agent.x, agent.y),
        {id: '', color: "#0000FF", pointRadius: "1"}
    );
    g_agent_layer.addFeatures(f);
    agent.f = f;

    agents.push(agent);
}

function ToTheOldPubInstead(agent)
{
    agent.type = "roost";

    var path_bridge_to_lights = 
    [
        [-734632.07698065, 7054094.4433433], 
        [-734528.76755963, 7054103.9979718], 
        [-734424.86097432, 7054115.9412575], 
        [-734352.00693175, 7054133.2590217], 
        [-734311.39976048, 7054114.7469289], 
        [-734264.82094638, 7054092.0546861], 
        [-734254.66915356, 7054089.0688647], 
        [-734245.71168931, 7054083.6943862], 
        [-734237.35138934, 7054074.7369219], 
        [-734230.18541794, 7054063.3908005], 
        [-734102.39226128, 7054106.9837939], 
        [-734091.0461399, 7054108.1781224], 
        [-734077.90852567, 7054106.3866296], 
        [-734062.3822543, 7054103.9979725], 
        [-734048.64747578, 7054097.4291653], 
        [-734039.09284725, 7054092.0546868], 
        [-734019.98359018, 7054050.253187], 
        [-733991.31970458, 7053994.1197443], 
        [-733951.9068619, 7053914.0997316], 
        [-733904.73088352, 7053811.9846391], 
        [-733895.17625498, 7053790.4867249]
    ];

    agent.wps =  agent.wps.concat(path_bridge_to_lights);

    if(Math.random() >= 0.5)
        agent.wps.push([-733838.44564805, 7053703.3007375]); // Roost path 01
    else
        agent.wps.push([-733852.77759086, 7053798.2498586]); // Roost path 02
}

function GenerateAgent_Iontas2Bridge()
{
    var abs_max = 3;

    var agent = new anagent();
    agent.setWayPoints
    ([
        [-734775.69499077 + myRandom(abs_max), 7054429.4525052 + myRandom(abs_max)],
        [-734782.86096217 + myRandom(abs_max), 7054412.7319053 + myRandom(abs_max)],
        [-734772.70916935, 7054384.0680197],
        [-734721.35304098, 7054272.995463],
        [-734712.39557673, 7054246.7202345],
        [-734703.43811248, 7054237.165606],
        [-734648.49899841, 7054122.5100636]
    ]);

    ToTheOldPubInstead(agent);

    var f = new OpenLayers.Feature.Vector
    (
        new OpenLayers.Geometry.Point(agent.x, agent.y),
        {id: '', color: "#4B0082", pointRadius: "1"}
    );
    g_agent_layer.addFeatures(f);
    agent.f = f;

    agents.push(agent);
}

function init()
{
    setup_campus_map();

    var roost_counter = new OpenLayers.Feature.Vector
    (
        new OpenLayers.Geometry.Point(-733830.95273754, 7053760.6285066),
        {id: '', color: "#0000FF", pointRadius: "1", fontSize: "20"}
    );
    g_obstacle_layer.addFeatures(roost_counter);

    console.log("init() " + g_playing);
    button_clicked();
}

// Starting point
function MapSingleClick(e)
{
    var lonlat = g_map.getLonLatFromViewPortPx(e.xy);
    
    var f = new OpenLayers.Feature.Vector
    (
        new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
        {id: '', color: "#FF0000", fontSize: "32px", yOff: "20", pointRadius: "2"}
    );

    g_obstacle_layer.addFeatures(f);
    
    a = new anagent();
    a.idle = true;
    a.setStart([lonlat.lon, lonlat.lat]);
    a.f = f;
    agents.push(a);
}

// Create and setup the Campus Map.
function setup_campus_map()
{
    // Create a Map of the Campus.
    g_map = new OpenLayers.Map('Campus', {controls: [new OpenLayers.Control.Navigation()]});
    
    // Map Controls.

    g_map.addControl(new OpenLayers.Control.LayerSwitcher()); // Layer switcher.
    g_map.addControl(new OpenLayers.Control.PanZoomBar());

    var clicks = new OpenLayers.Handler.Click
    (
        this,
        {
            click: function(e) { MapSingleClick(e); },
            dblclick: function(e) { MapDoubleClick(e); }
        },
        {single: true, 'double': true, stopSingle: true, stopDouble: true}
    ); 
    clicks.setMap(g_map);
    clicks.activate();
    
    // Map Layers.
    g_layer_mapnik = new OpenLayers.Layer.OSM("NUIM: North Campus");
    g_map.addLayer(g_layer_mapnik);
    
    //FW Edits
    w = 600
    //surface_layer = new OpenLayers.Layer.Surface("Surface", {size: new OpenLayers.Size(w, w)});
    //surface_layer.extent = g_map.getExtent();
    // canvas = $('<canvas></canvas>')[0];
    // canvas.width = w;
    // canvas.height = w;
    // ctx = canvas.getContext('2d');
    // surface_layer.url = canvas.toDataURL();
    
    surface_layer = new Canvas.Layer("Traces");
    g_map.addLayer(surface_layer);
    ctx = surface_layer.canvas.getContext('2d');
    
    g_agent_layer  = new OpenLayers.Layer.Vector("Agents", {styleMap: g_style_map});
    g_map.addLayer(g_agent_layer);
    
    g_obstacle_layer  = new OpenLayers.Layer.Vector("Obstacles", {styleMap: g_style_map});
    g_map.addLayer(g_obstacle_layer);
    
    // Map Settings.
    g_map.setCenter
    (
        new OpenLayers.LonLat(-6.600538, 53.383837)  // Center of the map
        .transform
        (
            new OpenLayers.Projection("EPSG:4326"),  // From: WGS 1984 (GPS)
            new OpenLayers.Projection("EPSG:900913") // To: Spherical Mercator Projection (Google)
        ), 
        18 // Zoom level
    );
}