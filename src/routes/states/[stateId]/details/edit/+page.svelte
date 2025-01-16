<script>
    import { page } from '$app/stores';
    import AddStateForm from '$lib/states/addState/AddStateForm.svelte';

    let formObject=[]
    let formDataFromQueryParams=$page.url.searchParams.get('data')
	
    if(formDataFromQueryParams){
        let parsedFormDataFromQueryParams=JSON.parse(formDataFromQueryParams)
        let adressArray=[]
        let phoneNumberArray=[]
        let emailArray=[]
        if(parsedFormDataFromQueryParams?.address){
            adressArray = parsedFormDataFromQueryParams?.address.split(',')

        }
        if(parsedFormDataFromQueryParams?.phoneNumber){
            phoneNumberArray = parsedFormDataFromQueryParams?.phoneNumber.split(',')
        }
        if(parsedFormDataFromQueryParams?.email){
            emailArray = parsedFormDataFromQueryParams?.email.split(',')
        }
		formObject = {
		title: parsedFormDataFromQueryParams?.name || parsedFormDataFromQueryParams?.title,
        addressLine1:adressArray[0],
		addressLine2: adressArray[1],
		cityTown: adressArray[2],
		pincode: adressArray[3],
		phoneno1: phoneNumberArray[0],
        phoneno2:phoneNumberArray[1],
        email1:emailArray[0],
        email2:emailArray[1],
		uuid:parsedFormDataFromQueryParams?.uuid,
	}}
</script>

<AddStateForm route={$page.route.id} params={$page.params} {formObject} />