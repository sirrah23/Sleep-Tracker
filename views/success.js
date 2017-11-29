$(function() {
  $('#sleeping').click(() => {
    fetch('/sleeping?type=sleeping').then(()=>{
      alert('Done');
    });
  });
    $('#waking-up').click(() => {
    fetch('/sleeping?type=waking').then(()=>{
      alert('Done');
    });
  });
});