(function(){
  // script for video banner
  const play = document.querySelector('.video-banner .video-play');
  const video = document.querySelector('.video-banner .video-wrap');
  if(play && video) {
    playVideo(play, video)
  }

  // script for video in "video with text section"
  const playMedia = document.querySelector('.video-with-text .video-play');
  const Media = document.querySelector('.video-with-text .video');
  if(playMedia && Media) {
    playVideo(playMedia, Media)
  }

  function playVideo(play,video) {
    play.addEventListener('click', function(){
      this.parentElement.style.display = 'none';
      video.style.display = 'block';
    })
  }
})()