document.addEventListener('DOMContentLoaded', function(){
	const reqVidForm = document.getElementById('req_vid_form');

	reqVidForm.addEventListener('submit', (event) => {
		event.preventDefault();

		let reqVidFormData = new FormData(reqVidForm);

		fetch('http://localhost:7777/video-request', {
			method: 'POST',
			body: {reqVidFormData}
		})
		.then(res => console.table(res))
	});
});