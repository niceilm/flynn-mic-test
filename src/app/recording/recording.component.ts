import { Component, OnDestroy, OnInit } from '@angular/core';
import { Howl, Howler } from 'howler';
import * as MediaRecorder from 'opus-media-recorder';
import { DomSanitizer } from '@angular/platform-browser';

interface OpusMediaRecorder extends EventTarget {
  stream: MediaStream;
  mimeType: string;
  state: 'inactive' | 'recording' | 'paused';
  audioBitsPerSecond: number;

  start(timeslice: number): void;

  stop(): void;

  pause(): void;

  resume(): void;

  requestData(): void;
}

@Component({
  selector: 'app-recording',
  templateUrl: './recording.component.html',
  styleUrls: ['./recording.component.scss']
})
export class RecordingComponent implements OnInit, OnDestroy {
  public recordings = [];
  private startSound: Howl;
  private stopSound: Howl;
  private timerId: number;
  private recorder: OpusMediaRecorder;

  public constructor(private sanitizer: DomSanitizer) {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    Howler.unload();
    clearTimeout(this.timerId);
  }

  public onRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.startSound = new Howl({ src: '/assets/sound/start-recording.mp3' });
      this.stopSound = new Howl({ src: '/assets/sound/stop-recording.mp3' });
      this.startSound.once('end', () => {
        this.timerId = setTimeout(() => {
          this.stopSound.play();
          this.recorder.stop();
        }, 1000);
      });
      const options = { mimeType: 'audio/ogg' };
      const workerOptions = {
        encoderWorkerFactory: () => new Worker('/opus-media-recorder/encoderWorker.umd.js'),
        OggOpusEncoderWasmPath: '/opus-media-recorder/OggOpusEncoder.wasm',
        WebMOpusEncoderWasmPath: '/opus-media-recorder/WebMOpusEncoder.wasm',
      };
      this.recorder = new MediaRecorder(stream, options, workerOptions);
      this.recorder.addEventListener('dataavailable', e => {
        this.recordings = this.recordings.concat([{ url: this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(e.data)) }]);
        stream.getTracks().forEach(track => track.stop());
      });
      this.startSound.play();
      this.recorder.start();
    });
  }
}
