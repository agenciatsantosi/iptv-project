import HLS from 'hls.js';

export class IPTVService {
  private player: HLS | null = null;

  initializePlayer(videoElement: HTMLVideoElement, streamUrl: string) {
    if (HLS.isSupported()) {
      this.player = new HLS({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        enableWorker: true,
      });

      this.player.loadSource(streamUrl);
      this.player.attachMedia(videoElement);
      
      this.player.on(HLS.Events.MANIFEST_PARSED, () => {
        videoElement.play();
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = streamUrl;
    }
  }

  setQuality(level: number) {
    if (this.player) {
      this.player.currentLevel = level;
    }
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}