function singleVidReq(vidReqInfo){
	let vidReqTemplate = document.createElement('div');
	vidReqTemplate.innerHTML = `
		<div class="card mb-3">
			<div class="card-body d-flex justify-content-between flex-row">
				<div class="d-flex flex-column">
					<h3>${vidReqInfo.topic_title}</h3>
					<p class="text-muted mb-2">${vidReqInfo.topic_details}</p>
					<p class="mb-0 text-muted">
						<strong>Expected results:</strong> ${vidReqInfo.expected_result}
					</p>
				</div>
				<div class="d-flex flex-column text-center">
					<a class="btn btn-link">🔺</a>
					<h3>0</h3>
					<a class="btn btn-link">🔻</a>
				</div>
			</div>
			<div class="card-footer d-flex flex-row justify-content-between">
				<div>
					<span class="text-info">${vidReqInfo.status.toUpperCase()}</span> &bullet; added by <strong>${vidReqInfo.author_name}</strong> on <strong>${new Date(vidReqInfo.submit_date).toLocaleDateString()}</strong>
				</div>
				<div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
					<div class="badge badge-success">${vidReqInfo.target_level}</div>
				</div>
			</div>
		</div>
	`;

	return vidReqTemplate;
}

document.addEventListener('DOMContentLoaded', function(){
	const reqVidForm = document.getElementById('req_vid_form');

	reqVidForm.addEventListener('submit', (event) => {
		event.preventDefault();

		let reqVidFormData = new FormData(reqVidForm);

		fetch('http://localhost:7777/video-request', {
			method: 'POST',
			body: {reqVidFormData}
		})
		.then(blob => blob.json())
		.then(res => console.table(res))
	});

	

	let vidRequets = document.getElementById('list_of_requests');

	fetch('http://localhost:7777/video-request', {
		method: 'GET'
	})
	.then(blob => blob.json())
	.then(res => {
		res.forEach(vidReqInfo => {
			vidRequets.appendChild(singleVidReq(vidReqInfo));
		});
	});
});