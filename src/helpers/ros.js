import { Ros, Topic } from 'roslib';


class ROS {
  constructor(roscore_ws = 'ws://localhost:9090') {
    this.roscore_ws = roscore_ws;
    this.ros = new Ros({ url: this.roscore_ws });

    this.ros.on('connection', function () {
      console.log('Connected to ROS bridge');
    });
    this.ros.on('error', function (er) {
      console.error('Connection failed:', er);
    });
    this.ros.on('close', function () {
      console.log('Closed connection');
    });
  }

  map = (callback = () => { }) => {
    const mapTopic = new Topic({
      ros: this.ros,
      name: '/map',
      messageType: 'nav_msgs/OccupancyGrid'
    });
    mapTopic.subscribe(function (msg) {
      return callback(msg);
    });
    return mapTopic.unsubscribe;
  }

  path = (callback = () => { }) => {
    const pathTopic = new Topic({
      ros: this.ros,
      name: '/path_recording/cmd_poses',
      messageType: 'geometry_msgs/PoseArray'
    });
    pathTopic.subscribe(function (msg) {
      return callback(msg);
    });
    return pathTopic.unsubscribe;
  }

  bot = (callback = () => { }) => {
    const botTopic = new Topic({
      ros: this.ros,
      name: '/ohmni_app_services/robot_pose',
      messageType: 'geometry_msgs/PoseStamped'
    });
    botTopic.subscribe(function (msg) {
      return callback(msg);
    });
    return botTopic.unsubscribe;
  }
}

export default ROS;