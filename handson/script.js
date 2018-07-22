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
      room.participants.forEach(participantConnected);

      room.on('participantConnected', participantConnected);
      room.on('participantDisonnected', participantDisconnected);
      room.once('disconnected', error => room.participants.forEach(participantDisconnected));
    });  
  });

  // すでに接続している参加者に関する処理を追加    
  function participantConnected(participant) {
    console.log(`Participant ${participant.identity} connected'`);

    const videoDom = document.createElement('div');
    videoDom.id = participant.sid;
    videoDom.className = 'videoDom';
    participant.on('trackAdded', track => trackAdded(videoDom, track));
    participant.tracks.forEach(track => trackAdded(videoDom, track));
    participant.on('trackRemoved', trackRemoved);

    $('.videosContainer').append(videoDom);

  }

  // 参加者が退出したときの処理を追加
  function participantDisconnected(participant) {
    console.log(`Participant ${participant.identity} disconnected.`);

    participant.tracks.forEach(trackRemoved);
    document.getElementById(participant.sid).remove();
  }

  // トラックを追加します
  function trackAdded(videoDom, track) {
    videoDom.appendChild(track.attach()); 
  }

  // トラックを削除します
  function trackRemoved(track) {
    track.detach().forEach(element => element.remove());
  }
});
