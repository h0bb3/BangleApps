var method=2;  // 1 = send to bluetooth
var maxSize=0;
var filename="0raw_0.csv";
var prevTime = Date.now();

var doRun = false;

var events = -1;
var hrmRaw,hrmPulse,bthrmPulse;

require("Storage").compact();

  
if (Bangle.setBTHRMPower){
  Bangle.setBTHRMPower(1);
} else {
  gotBTHRM = true;
}


var write=null;
if (method == 1){
  write = function(str){Bluetooth.print("DATA: " + str);events++;};
}



Bluetooth.print("Time:" + prevTime);


function writeHRMraw(e){
  t = Date.now();
  if (doRun === true) {
    gotHRMraw = true;
    hrmRaw = e.raw;
    acc = Bangle.getAccel();
    dt = t - prevTime;
    //Bluetooth.print("Time:" + dt + "\n");
    write(dt.toFixed(2)+","+acc.x+","+acc.y+","+acc.z+","+e.raw+","+e.filt+","+e.vcPPG+","+e.vcPPGoffs+"\n");
  }
  prevTime = t;
}

function onButton() {
  Bluetooth.print("onButton\n");

  const files = require("Storage").list(/\.csv$/, {sf:true});
  //Bluetooth.print("files " + files.length + "\n");
  
  if (!doRun && files.length < 1) {
    // Move to running state
    // first erase and compact file storage
    //Bluetooth.print("Erasing and Creating file\n");
    //var f = require('Storage').open(filename,"w");
    //f.erase();
    //require("Storage").compact();
    const f = require('Storage').open(filename,"w");
    write = function(str){f.write(str);events++;};
    write("Time,Acc_x,Acc_y,Acc_z,PPG_r,PPG_f,PPG_vc,PPG_o\n");
    Bluetooth.print("doRun\n");
    doRun = true;
    
  } else {
    Bluetooth.print("do not run\n");
    doRun = false;
  }
  
  setWatch(onButton, BTN1);
}




  g.clear();
  function drawStatusText(name, y){
    g.setFont12x20();
    g.setColor(g.theme.fg);
    g.drawString(name, 20, y * 22 + 2);
  }
  function drawStatus(isOk, y, value){
    g.setFont12x20();
    if (isOk) g.setColor(0,1,0); else g.setColor(1,0,0);
    g.fillRect(0,y * 22, 20, y * 22 + 20);
    g.setColor(g.theme.bg);
    let x = 120;
    g.fillRect(x,y*22,g.getWidth(),y*22+20);
    g.setColor(g.theme.fg);
    if (value) g.drawString(value, x, y * 22 + 2);
  }

  function updateStatus(){
    let h = 1;

    drawStatus(events>0, h++, Math.max(events,0));
    let free = require('Storage').getFree();
    drawStatus(free / 1024 > 4000, h++, Math.floor(free/1024) + "K");
    if (free / 1024 < 4000) {
      doRun = false;
      // switch to bluethoot writing
      //write = function(str){Bluetooth.print("DATA: " + str);events++;};
    }
  }


Bangle.setPollInterval(20); //50.25Hz
Bangle.setOptions({hrmPollInterval:20});  //50 Hz
Bangle.on("HRM-raw", writeHRMraw);
Bangle.setHRMPower(true, "eliteapp");

  var intervalId = -1;
  g.setFont12x20();
  g.setColor(g.theme.fg);
  g.drawString("Target " + (method==2?filename:"Bluetooth"), 0, 2);
  let h = 1;
  //drawStatusText("Acc", h++);
  //drawStatusText("BTHRM", h++);
  //drawStatusText("HRM", h++);
  //drawStatusText("HRM_r", h++);
  drawStatusText("Events", h++);
  if (method == 2) drawStatusText("Storage", h++);
  updateStatus();

   setWatch(onButton, BTN1);
  
  intervalId = setInterval(()=>{
    updateStatus();
  }, 1000);

  if (Bangle.setBTHRMPower){
    intervalId = setInterval(()=>{
      if (!Bangle.isBTHRMOn()) Bangle.setBTHRMPower(1);
    }, 5000);
  }
