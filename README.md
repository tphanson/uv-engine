# UV Engine - A Path Editor

**Abstract.** In order to support users to interate with UV stack on Ohmni, this web-based application offers a funtional interface including an editor and an monitor. By the application, users to complete both tasks of creating plans and cleaning.

## Comunication

The application is organized basing on the micro-service model. The UV Engine will connect to ROS bridge and UV Engine API to execute commands. In general,

* Realtime data: including Bot position, map data are provided via ROS bridge.
* REST api: including update plan, bot info, and others are provided via apis by UV engine API.

Beside that, there are some auxiliary servers that will be concretely mentioned in the next sessions.

## Authetication

There are 2 methods to login and use the application namely Ohmnilabs authetication and Google authentication.

Ohmnilabs authentication employes username/password methods for the handshake with `https://api-branch.ohmnilabs.com`. Then, the server will release a periodic token for authorized communication afterwards.

In regard to Google authentication, because the application is accessed from local network through the IP, the Google authentication is not available at this time.

## Libraries

*Which usually placed in `helpers`.*

### ROS

Currently, we've already supported 3 topics and 1 action. All the messages will be exchanged through a ROS bridge that has run on Ohmni.

* map: `{variant: 'topic', name: '/map', type: 'nav_msgs/OccupancyGrid'}`, listens the map that has P5 PGM format. To convert the map to image, we has `pgm` library.
* path: `{variant: 'topic', name: '/path_recording/cmd_poses', type: 'geometry_msgs/PoseArray'}`, listens an array of poses.
* bot: `{variant: 'topic', name: '/ohmni_app_services/robot_pose', type: 'geometry_msgs/PoseStamped'}`, listens the bot's pose.
* cleaning: `{variant: 'action', serverName: '/LUVcontroller', actionName: 'path_msgs/LUVControllerAction'}`, trigger the action of cleaning with inputs:
  * flag: `true` to start, `false` to stop. Default: `false`.
  * startPOI: index of start segment. Default: `0`.
  * stopPOI: index of end segment. Default: `0`, which clean the whole path.
  * cycles: the number of testing cycles. Default: `1`.
  * callback: (optional) return response with params `(error, response)`.

Example for cleaning:

```
# Init ros connection
const ros = new ROS(<rosbridge_url>);
# Start cleaning the second segment on the path
ros.cleaning(true, 1, 2, 1, (er,re)=>{
  if (er) return console.error(er);
  return console.log(re);
});
# Stop cleaning
ros.cleaning(false, 1, 2, 1, (er,re)=>{
  if (er) return console.error(er);
  return console.log(re);
});
```

### PGM

In this lib, we manually manipulate pixel values on a canvas with respect to the received data under P5 PGM format. From the canvas, it can generate a `png` image for usage. However, the coordinates between ROS and canvas are quite opposite. In ROS, the root is bottom-left. On the other hand, the root is top-left in canvas. Therefore, we utilized `jimp` package to conviniently flip the image.

### Third parties

* [ReactJS](https://reactjs.org/): a frontend framework.

* [Redux](https://redux.js.org/): a data-driven framework to manage the data flow in the application.

* [ROSLib](http://robotwebtools.org/jsdoc/roslibjs/current/): To implement the ros bridge communication.

* [Material UI](https://material-ui.com/getting-started/installation/): For quick development, we use MUI to deploy the interface.

* [Konva](https://konvajs.org/): To draw and visualize the map, the path, the bot and others.

## The editor

### Load maps

First of all, users need to load the desired map to edit. The list of maps is fetched from the cloud server, `https://api-branch.ohmnilabs.com/app/bots/<botId>/maps`. In addition, the `botId` should be fetched by `/bot` api from the UV engine API.

With the list of maps, users can choose a map to edit. When the user choose one, the `getMap` (in `bot.reducer.js`) will be called to notify the servers to publish the map via map topic.

**Legacy.** Back in the day, we listened the map data from a ROS topic which you could find it's vestige in `ros.js`. However, it was noticeably slow. We decided to migrate the map to local and load it from bot. The speed is improved a lot.

**Mirror problem.** If you load from topic, the map will be horizontally mirrored.


### Edit maps (path)

Currently, the path is the only component we allows to edit. We utilize Konva to render and compute tranformation of components inside the map. There 2 main things we need to highlight here:

**Coordinate.** In canvas the root is top-left but it's bottom-left in ROS-based data.

**Zoom.** The tool also has ability to zoom in/out the map then the components' position should be relative values.

These remarks above all lead to a transformation. Therefore, a re-computation of transform is needed for every single components in the map. `transform` and `inverseTransform` will eliminate the pain of computation.

```
transform = ({ x, y }) => {
  const { map } = this.props;
  const { wide, ratio } = this.state;
  if (!map || !map.width || !wide) return { x: 0, y: 0 }
  const { width, height, origin, resolution } = map;
  return {
    x: ((x - origin.x) * wide) / (resolution * width),
    y: ((resolution * height - y + origin.y) * (wide / ratio)) / (resolution * height)
  }
}
inverseTransform = ({ x, y }) => {
  const { map } = this.props;
  const { wide, ratio } = this.state;
  if (!map || !map.width || !wide) return { x: 0, y: 0 }
  const { width, height, origin, resolution } = map;
  return {
    x: x * (resolution * width) / wide + origin.x,
    y: origin.y + (resolution * height) - y * (resolution * height) / (wide / ratio)
  }
}
```

`transform` let the children can compute its relative position compared to the map coordinate. `inverseTransform` do the opposite, computing the relative position to the absolute position of children. These function will transfer to children by the map as props.

## The monitor

This section is pretty simple, it reuses several components in the editor section but removes editability. And running full path is default in monitoring mode.