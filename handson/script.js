$(function(){
  let localStream = null;
  let viedoRoom = null;

  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
      $('#myStream').get(0).srcObject = stream;
      localStream = stream;
    }).catch(error => {
      console.error(`mediaDevice.getUserMedia() error: ${error}`);
      return;
    });

  $.getJSON(`../video-token`, function(tokenResponse) {
    console.log(tokenResponse.token);
    Twilio.Video.connect(tokenResponse.token, {
      name: 'videoRoom',
    })
    .then(room => {
      console.log(`Connected to Room ${room.name}`);
      $('#my-id').text(room.localParticipant.identity);
      videoRoom = room;
    });  
  });
});
