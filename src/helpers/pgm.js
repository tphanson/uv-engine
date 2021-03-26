class PGM {
  constructor(fileObjectOrStringData, canvas, width = 0, height = 0) {
    this.fileObjectOrStringData = fileObjectOrStringData;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
  }

  _toString = () => {
    return new Promise((resolve, _reject) => {
      if (typeof this.fileObjectOrStringData === 'string')
        return resolve(this.fileObjectOrStringData);
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsText(this.fileObjectOrStringData);
    });
  }

  _filterData = (data) => {
    data = data.split('\n');
    return data.filter(row => {
      const first = row.substring(0, 1);
      return first !== '#';
    });
  }

  _validateData = (data) => {
    if (data.length !== 4) return false;
    const [format, size, range, value] = data;
    if (!format || !size || !range || !value) return false;
    const [width, height] = size.split(' ').map(e => parseInt(e));
    if (!width || !height) return false;
    const maxValue = parseInt(range);
    if (!maxValue) return false;
    const buffer = Buffer.from(value, 'ascii');
    return { format, width, height, maxValue, buffer };
  }

  /**
   * Pixels manipulation
   * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
   */
  _drawToCanvas = (width, height, maxValue, buffer) => {
    const ctx = this.canvas.getContext('2d');
    let imageData = ctx.createImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const offset = Number(i / 4);
      const value = Number(buffer[offset] / maxValue * 255)
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return imageData;
  }

  draw = () => {
    return new Promise((resolve, reject) => {
      return this._toString().then(re => {
        if (!re || typeof re !== 'string') return reject('Empty data');
        re = this._filterData(re);
        const data = this._validateData(re);
        if (!data) return reject('Invalid data');
        const { format, width, height, maxValue, buffer } = data;
        if (format !== 'P5') return reject('Unsupported format. Now we only support P5 format.');
        if (buffer.length !== width * height) return reject('Unmatched data length');
        this._drawToCanvas(width, height, maxValue, buffer);
        const image = new Image();
        image.src = this.canvas.toDataURL()
        return resolve({ width, height, image });
      }).catch(er => {
        return reject(er);
      });
    });
  }
}

export default PGM;