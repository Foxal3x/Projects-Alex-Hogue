import rospy
from geometry_msgs.msg import Twist
from std_msgs.msg import Empty
import time

def move_drone_to_box(box_position):
    rospy.init_node('drone_mover')
    velocity_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=10)
    takeoff_pub = rospy.Publisher('/takeoff', Empty, queue_size=10)

    # Wait for publishers to be ready
    rospy.sleep(1)
    
    # Take off to a certain height (optional)
    takeoff_pub.publish(Empty())
    rospy.sleep(2)  # Give some time for the drone to take off

    # Create a Twist message to control the drone
    move_cmd = Twist()


    real_x = box_position[0] * 0.01
    real_y = box_position[1] * 0.01
    
    move_cmd.linear.x = real_x  
    move_cmd.linear.y = real_y  
    move_cmd.linear.z = 0.0 

    velocity_pub.publish(move_cmd)

    time.sleep(2)  

    move_cmd.linear.x = 0.0
    move_cmd.linear.y = 0.0
    velocity_pub.publish(move_cmd)

if __name__ == "__main__":
    detected_boxes = 
    for box in detected_boxes:
        move_drone_to_box(box)
