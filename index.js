import Interactivideo from "./src/";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ivPlayer = new Interactivideo.Player("iv-player", {
  fps: 30
});
ivPlayer.load('./sample.mp4');

const ivCanvasPlayer = new Interactivideo.CanvasPlayer("iv-canvas-player", {
  dir: '/interactivideo-data/',
});
ivCanvasPlayer.load({
  id: 'airpodspro-webp',
  totalFrames: 45,  
});

const ivCanvasPlayer02 = new Interactivideo.CanvasPlayer("iv-canvas-player02", {
  dir: '/interactivideo-data/',
  fps: 60
});

gsap.timeline({
  scrollTrigger: {
    trigger: ".sec01__video",
    start: "0% 0%",
    endTrigger: ".sec01",
    end: "100% 0%",
    pin: true,
    scrub: 1.0,
    pinSpacing: false,
    markers: false,
    onUpdate: (e) => {
      ivPlayer.playWithProgress(e.progress);
    },
  },
});

gsap.timeline({
  scrollTrigger: {
    trigger: ".sec02__video",
    start: "center center",
    endTrigger: ".sec02",
    end: "100% 100%",
    pin: true,
    scrub: 1.0,
    pinSpacing: false,
    markers: false,
    onUpdate: (e) => {
      ivCanvasPlayer.playWithProgress(e.progress);
      console.log(e.progress)
    },
  },
});


const loadBtn = document.getElementById('btn-load');
const playBtn = document.getElementById('btn-play');
const loopBtn = document.getElementById('btn-play-loop');
const reverseBtn = document.getElementById('btn-play-reverse');
const pauseBtn = document.getElementById('btn-pause');
  
playBtn.style.display = 'none';
loopBtn.style.display = 'none';
reverseBtn.style.display = 'none';
pauseBtn.style.display = 'none';

loadBtn.addEventListener('click', ()=> {
  ivCanvasPlayer02.load({
    id: 'airpodspro-webp',
    totalFrames: 45,
  })
  loadBtn.style.display = 'none';
  playBtn.style.display = 'inline-flex';
  loopBtn.style.display = 'inline-flex';
  reverseBtn.style.display = 'inline-flex';
  pauseBtn.style.display = 'inline-flex';
})
playBtn.addEventListener('click', ()=> {
  ivCanvasPlayer02.play({
  })
})
loopBtn.addEventListener('click', ()=> {
  ivCanvasPlayer02.play({
    loop: true
  })
})
reverseBtn.addEventListener('click', ()=> {
  ivCanvasPlayer02.play({
    reverse: true
  })
})
pauseBtn.addEventListener('click', ()=> {
  ivCanvasPlayer02.pause()
})