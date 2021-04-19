import { Ros, Topic, ActionClient, Goal } from 'roslib';


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

  startCleaning = (callback = () => { }) => {
    const cleaningAction = new ActionClient({
      ros: this.ros,
      serverName: '/LUVcontroller',
      actionName: 'path_msgs/LUVControllerAction'
    });
    const goal = new Goal({
      actionClient: cleaningAction,
      goalMessage: {
        start_controller: true
      }
    });
    goal.on('result', function (response) {
      cleaningAction.dispose();
      const { result_id, message } = response || {}
      // uint8 PENDING=0
      // uint8 ACTIVE=1
      // uint8 PREEMPTED=2
      // uint8 SUCCEEDED=3
      // uint8 ABORTED=4
      // uint8 REJECTED=5
      // uint8 PREEMPTING=6
      // uint8 RECALLING=7
      // uint8 RECALLED=8
      // uint8 LOST=9
      if (!result_id) return callback('ROS has no response', null);
      if (result_id === 4) return callback(message || 'Sequence aborted', null);
      if (result_id === 5) return callback(message || 'Failed to start', null);
      return callback(null, response);
    });
    return goal.send();
  }
}

export default ROS;