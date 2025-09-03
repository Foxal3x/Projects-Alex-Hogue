ArrayList<Square> sl = new ArrayList<Square>();
int globalTargetIndex = 0;

class quad {
  int frame=0;
  ArrayList<quad> qcl = new ArrayList<quad>();
  Square square;
  int MAX_DEPTH = 5;
  int depth=0;
  int splitTime = max(10, 170 - depth * 80);
  Boolean division=false;
  Boolean arrived=false;
  Boolean gridOccupied[][]=new Boolean[64][64];
  ArrayList<PVector> textTargets = new ArrayList<PVector>();
  boolean textPrepared = false;

void prepareTextTargets() {
  textTargets.clear();
  for (int i = 0; i < 64; i++) {
    for (int j = 0; j < 64; j++) {
      if (grid[i][j] == 1) {
        float tx = 244 + j * 8;
        float ty = 244 + i * 8;
        textTargets.add(new PVector(tx, ty));
        print(tx,"   ",ty);
      }
    }
  }

  textPrepared = true;
}


void assignNextTextTarget(Square s) {
  if (!textTargets.isEmpty()) {
    int index = globalTargetIndex % textTargets.size();  // wrap around
    PVector target = textTargets.get(index);
    s.go(target.x, target.y);
    s.goIdle = true;
    globalTargetIndex++;
  } else {
    s.patrol();  // fallback if list is empty
  }
}
  
  quad(Square s, int d){
    depth=d;
    square=s;
  }
  
  void update(){
    if (division) {
      boolean allArrived = true;
  
      for (quad q : qcl) {
        q.update();
        if (!q.square.arrived)allArrived = false;
      }
      // Optionally extend child split times if waiting too long
      if (!allArrived && qcl.size() > 0 && qcl.get(0).splitTime - qcl.get(0).frame <= 50) {for (quad q : qcl) q.splitTime += 50;}
      return;
    }
    
    
    frame++;
    if(depth >=MAX_DEPTH){
      square.display();
      if (square.arrived && square.notchecked) {
        square.visited();
        sl.add(square);
      
        if (!textPrepared) {
          prepareTextTargets();
        }
    
        assignNextTextTarget(square);
      }

      return;
    }
    if (square.display() && frame>=splitTime) {
      
      division = true;
      int newSize = square.size / 2;
      
      ArrayList<float[]> destinations = new ArrayList<float[]>();
      int [][] offset={{0,-1},{0,0},{-1,0},{-1,-1}};
      int lastAction=(square.actions.get(square.actions.size()-1));
      //println(square.actions.size());

      for (int i = 0; i < 4; i++) {
        float dx = square.x + square.pivotOffset[i][0] * square.size + newSize*offset[lastAction][0];
        float dy = square.y + square.pivotOffset[i][1] * square.size + newSize*offset[lastAction][1];
        //println(dx,"  y is ",dy );
        destinations.add(new float[] { dx, dy });
      }
      
      Boolean[] tf = {true, true, false, false};
      Collections.shuffle(Arrays.asList(tf));
      Collections.shuffle(destinations);
    
      for (int i = 0; i < 4; i++) {
        float cx = square.x + square.pivotOffset[i][0] * newSize;
        float cy = square.y + square.pivotOffset[i][1] * newSize;

        quad child = new quad(
          new Square(cx, cy, newSize, tf[i], (int)max(5, random(22,31) - depth * 5),(int)max(5, random(15,25) - depth * 5),new ArrayList<Integer>(), true,lastAction),
          depth + 1
        );
        child.square.go(destinations.get(i)[0], destinations.get(i)[1],lastAction);  // i is 0~3, known la
        qcl.add(child);
      }
    }
  }
  
}
