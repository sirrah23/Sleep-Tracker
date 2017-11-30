$(function() {
  $('#sleeping').click(() => {
    fetch('/updatesheet?type=sleeping').then(()=>{
      alert('Done');
    });
  });
    $('#waking-up').click(() => {
    fetch('/updatesheet?type=waking').then(()=>{
      alert('Done');
    });
  });
});