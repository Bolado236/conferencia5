import Quagga from 'quagga';

export class CameraScanner {
  constructor(buttonId, onDetected) {
    this.button = document.getElementById(buttonId);
    this.onDetected = onDetected;

    this.button.addEventListener('click', () => this.startScanner());
  }

  startScanner() {
    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#cameraView')
      },
      decoder: {
        readers: ['ean_reader']
      }
    }, err => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected(data => {
      const code = data.codeResult.code;
      this.onDetected(code);
      Quagga.stop();
    });
  }
}
