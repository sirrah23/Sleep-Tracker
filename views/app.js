$(function() {
  $('#sleeping').click(() => {
    fetch('/updatesheet?type=sleeping').then((response)=>{
      if(response.status === 200){
        alert('Done')
      } else {
        alert('Something went wrong')
      }
    });
  });
    $('#waking-up').click(() => {
    fetch('/updatesheet?type=waking').then((response)=>{
      if(response.status === 200){
        alert('Done')
      } else {
        alert('Something went wrong')
      }
    });
  });
});