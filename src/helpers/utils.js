import dcp from 'deepcopy';

const utils = {}

utils.prettyNumber = (n) => {
  n = parseFloat(n);
  n = parseInt(n * 1000);
  n = n / 1000;
  return n;
}

utils.smoothPosition = (poses, gamma = 0.7) => {
  let v0 = null;
  const refinedPoses = poses.map(re => {
    const pose = dcp(re);
    const { position: v1 } = pose;
    if (!v0) v0 = dcp(v1);
    const x = gamma * v0.x + (1 - gamma) * v1.x;
    const y = gamma * v0.y + (1 - gamma) * v1.y;
    const z = gamma * v0.z + (1 - gamma) * v1.z;
    v0 = { x, y, z }
    pose.position = dcp(v0);
    return pose;
  });

  return refinedPoses;
}

export default utils;