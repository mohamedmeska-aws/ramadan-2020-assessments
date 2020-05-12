let vidRequets = document.getElementById('list_of_requests');

let sortBy = 'sort_by_new_first';

let searchTerm = '';

function singleVidReq(vidReqInfo, isPrepend){
	let vidReqTemplate = document.createElement('div');
	vidReqTemplate.innerHTML = `
		<div class="card mb-3">
			<div class="card-body d-flex justify-content-between flex-row">
				<div class="d-flex flex-column">
					<h3>${vidReqInfo.topic_title}</h3>
					<p class="text-muted mb-2">${vidReqInfo.topic_details}</p>
					<p class="mb-0 text-muted">
						${vidReqInfo.expected_result && `<strong>Expected results:</strong> ${vidReqInfo.expected_result}`}
					</p>
				</div>
				<div class="d-flex flex-column text-center">
					<a class="btn btn-link" id="vote_up_${vidReqInfo._id}">🔺</a>
					<h3 id="vote_value_${vidReqInfo._id}">${vidReqInfo.votes.ups - vidReqInfo.votes.downs}</h3>
					<a class="btn btn-link" id="vote_down_${vidReqInfo._id}">🔻</a>
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

	if (isPrepend)
		vidRequets.prepend(vidReqTemplate);
	else
		vidRequets.appendChild(vidReqTemplate);

	let vote_up = document.getElementById(`vote_up_${vidReqInfo._id}`),
		vote_down = document.getElementById(`vote_down_${vidReqInfo._id}`),
		vote_value = document.getElementById(`vote_value_${vidReqInfo._id}`);

	vote_up.addEventListener('click', function(){
		fetch('http://localhost:7777/video-request/vote', {
			method: 'PUT',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify({id: vidReqInfo._id, vote_type: 'ups'})
		})
		.then(bolb => bolb.json())
		.then(res => {
			vote_value.innerText = res.votes.ups - res.votes.downs;
		});
	});

	vote_down.addEventListener('click', function(){
		fetch('http://localhost:7777/video-request/vote', {
			method: 'PUT',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify({id: vidReqInfo._id, vote_type: 'downs'})
		})
		.then(bolb => bolb.json())
		.then(res => {
			vote_value.innerText = res.votes.ups - res.votes.downs;
		});
	});
}

function checkValidity(reqVidFormData){
	let name = reqVidFormData.get('author_name'),
		email = reqVidFormData.get('author_email'),
		topic = reqVidFormData.get('topic_title'),
		details = reqVidFormData.get('topic_details'),
		result = reqVidFormData.get('expected_result');

	if (!name) {
		document.querySelector('[name=author_name]').classList.add('is-invalid');
	}

	let emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	if (!email || !emailPattern.test(email)) {
		document.querySelector('[name=author_email]').classList.add('is-invalid');
	}

	if (!topic || topic.length > 25) {
		document.querySelector('[name=topic_title]').classList.add('is-invalid');
	}

	if (!details) {
		document.querySelector('[name=topic_details]').classList.add('is-invalid');
	}

	if (!result) {
		document.querySelector('[name=expected_result]').classList.add('is-invalid');
	}

	let allInavlidInputs = document.getElementById('req_vid_form').querySelectorAll('.is-invalid');

	if (allInavlidInputs.length) {
		allInavlidInputs.forEach((invalidInput) => {
			invalidInput.addEventListener('input', function(){
				this.classList.remove('is-invalid');
			});
		});

		return false;
	} else {
		return true
	}
}

function loadAllVidRequests(sortBy, searchTerm){
	fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`, {
		method: 'GET'
	})
	.then(blob => blob.json())
	.then(res => {
		vidRequets.innerHTML = '';
		res.forEach(vidReqInfo => {
			singleVidReq(vidReqInfo, false);
		});
	});
}

function debounce(fn, time){
	let timeout;

	return function(...args){
		clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(this, args), time);
	};
}

document.addEventListener('DOMContentLoaded', function(){
	const reqVidForm = document.getElementById('req_vid_form');

	let sortByElms = document.querySelectorAll('[id*=sort_by_]');

	let searchBox = document.getElementById('search_box');

	loadAllVidRequests(sortBy, searchTerm);

	searchBox.addEventListener('input',
		debounce((e) => {
			searchTerm = e.target.value;

			loadAllVidRequests(sortBy, searchTerm);
		}, 300)
	);

	sortByElms.forEach((elm) => {
		elm.addEventListener('click', function(e){
			e.preventDefault();

			sortBy = this.querySelector('input').value;

			loadAllVidRequests(sortBy, searchTerm);

			this.classList.add('active');

			if(sortBy == 'sort_by_top_voted')
				document.getElementById('sort_by_new_first').classList.remove('active');
			else
				document.getElementById('sort_by_top_voted').classList.remove('active');
		});
	});

	reqVidForm.addEventListener('submit', (event) => {
		event.preventDefault();

		let reqVidFormData = new FormData(reqVidForm);

		let isValid = checkValidity(reqVidFormData);

		if (!isValid) {
			return;
		}

		fetch('http://localhost:7777/video-request', {
			method: 'POST',
			body: reqVidFormData
		})
		.then(blob => blob.json())
		.then(res => {
			singleVidReq(res, true);

			for (let input_field of reqVidFormData.entries()) {
			    document.getElementsByName(input_field[0])[0].value = '';
			}
		});
	});
});
