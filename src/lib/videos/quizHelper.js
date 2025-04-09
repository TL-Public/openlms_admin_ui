export async function linkContentAndQP({ questionPaper, contentType, contentUuid }) {

	let payload = {
		contentUuid: contentUuid,
		questionPaperUuid: questionPaper?.uuid,
		contentType: contentType,
		questionPaper: questionPaper
	};

	try {
		const response = await fetch('/apis/quizzes/linkedContent', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});


		if (!response.ok) {
			throw new Error('Failed to publish quiz');
		}

		if (response.status == 200) {
			const data = await response.json();
			return { data, isSuccess: true };
			// alert('Quiz linked to video successfully!');
		}

		return { isSuccess: false }
	} catch (error) {
		console.error('Error publishing quiz:', error);
		return { error: error, isSuccess: false };
		// alert('Failed to publish quiz. Please try again.');
	}
}


export async function deleteQPFromContent({ questionPaper, contentType, contentUuid }) {

	try {
		const response = await fetch(`/apis/quizzes/linkedContent/${contentUuid}?questionPaperUuid=${questionPaper?.uuid}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to delete quiz');
		}

		if (response.status == 204) {
			return { isSuccess: true };
		}
	} catch (error) {
		console.error('Error publishing quiz:', error);
		return { error: error, isSuccess: false };
	}
}
