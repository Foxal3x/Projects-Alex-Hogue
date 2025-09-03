import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;


class Square {
  public float x, y;       // top-left corner of square
  public int size;
  int curDir;
  Boolean ccw;
  float cx, cy;     // pivot (corner we rotate around)
  int finishingTime;
  int time;
  int pauseTime=30;
  int curStep=0;
  int la=3;
  ArrayList<Integer> plan;
  Boolean division,arrived=false,notchecked=true,goIdle=false,idling=false;
  public ArrayList<Integer> actions=new ArrayList<Integer>();
  public ArrayList<Integer[]> places=new ArrayList<Integer[]>();

  public final int[][] pivotOffset = { {0, 0}, {1, 0}, {1, 1}, {0, 1} };  // TL, TR, BR, BL
  int[][] locOffset   = { {-1, 0}, {0, -1}, {1, 0}, {0, 1} }; // Left, Up, Right, Down

  Square(float tx, float ty, int ts, Boolean c, int t,int pt, ArrayList<Integer> p, Boolean d,int lastAction) {
    x = tx;
    y = ty;
    size = ts;
    finishingTime = t;
    pauseTime=pt;
    time = 0;
    ccw=c;
    la=lastAction;
    plan=p;
    division = d;
    if (plan.size() > 0) {
      prepare();  // don't increment curStep yet
    }
  }

  void prepare() {
    if (plan == null || plan.size() == 0 || curStep >= plan.size()) {patrol(); return;}
    curDir = plan.get(curStep);
    if(ccw){
      cx = x + pivotOffset[curDir][0] * size;
      cy = y + pivotOffset[curDir][1] * size;
    }else{
      int pivotDir = (curDir + 3) % 4;  // CW: opposite corner
      cx = x + pivotOffset[pivotDir][0] * size;
      cy = y + pivotOffset[pivotDir][1] * size;
    }
  }

  void finishMove() {
    x += locOffset[curDir][0] * size;
    y += locOffset[curDir][1] * size;
    curDir = plan.get(curStep);
    actions.add(curDir);
  }
  
  void go(float gx, float gy, int laOverride) {
    go(gx, gy);      // normal plan generation
    la = laOverride; // manually assign correct final la
  }

  void go(float gx, float gy) {
    if(size==0)return;
    int dx = (int)round(((gx - x) / size));
    int dy = (int)round(((gy - y) / size));
  
    
    plan = new ArrayList<Integer>();
    int dirX = dx > 0 ? 2 : 0;
    int dirY = dy > 0 ? 3 : 1;
  
    for (int i = 0; i < abs(dx); i++) plan.add(dirX);
    for (int i = 0; i < abs(dy); i++) plan.add(dirY);
    Collections.shuffle(plan);

    curStep = 0;
    time = 0;
    prepare();

  }

  void patrol() {
    plan = new ArrayList<Integer>();
    arrived=true;
    for (int i = 0; i < 4; i++) {
      plan.add((la + i+1) % 4);
    }
  
    curStep = 0;
    time = 0;
    prepare();
  }

  Boolean visited(){
    if (notchecked){notchecked=false;return true;}
    else return false;
  }
  
  void idle(){idling=true;rect(x,y,size,size);}

  Boolean display() {
    if(size==0)return false;
    if(curStep == plan.size()) {
      if (curStep == plan.size()) {
        if (goIdle) {
          // Check for other idle square at the same location
          for (Square other : sl) {
            if (other != this && other.idling && dist(x, y, other.x, other.y) < 0.5) {
              size = 0;  // Disappear if already taken
              return false;
            }
          }
          idle();  // No conflict, become the one that lights up
          return false;
        }

      //println(x, "  y is ",y, "  then la is ",la);
      rect(x,y,size,size);
      patrol();
      return false;
      }
    }

    // Determine angle (freeze at 90° after rotation ends)
    float angle;
    if (time <= finishingTime) angle = radians(time * 90.0 / finishingTime);
    else angle = radians(90);  // frozen during pause }
    if (!ccw) angle *= -1;
  
    // Draw
    pushMatrix();
    translate(cx, cy);
    rotate(angle);
    fill(0);
  
    if (ccw) rect(-pivotOffset[curDir][0] * size, -pivotOffset[curDir][1] * size, size, size);
    else {
      int pivotDir = (curDir + 3) % 4;
      rect(-pivotOffset[pivotDir][0] * size, -pivotOffset[pivotDir][1] * size, size, size);
    }
    popMatrix();
  
    // Handle time and step updates
    if (time > finishingTime) {
      if (time < finishingTime + pauseTime) {
        time++;
      } else {
        finishMove();
        curStep++;  // moved here
        if (curStep < plan.size()) {
          prepare();
        }
        time = 0;
        return true;
      }
    } else {
      time++;
    }
    return false;
  }
}
