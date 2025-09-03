quad qc;
int cnt = 0;
int stopTime=90000;

void setup() {
  size(1000, 1000);
  noStroke();
  qc = new quad(
    new Square(244, 244, 256, true, 30, 20, new ArrayList<Integer>(Arrays.asList( 2, 3,0,1)), true, 3),
    0
  );
  qc.prepareTextTargets();  
}

void draw() {
  background(255);
  qc.update();

  //saveFrame("frames/frame-####.png");   // toggle if you want to save every frame

  if (cnt++ > stopTime) exit();  
}
