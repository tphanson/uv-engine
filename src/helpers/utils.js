const utils = {}

utils.prettyNumber = (n) => {
  n = parseFloat(n);
  n = parseInt(n * 1000);
  n = n / 1000;
  return n;
}


export default utils;