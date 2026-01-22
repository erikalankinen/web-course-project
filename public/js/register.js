//Initialize registration form submission listener
const initializeRegister = () => {
    document.getElementById("registerForm").addEventListener("submit", (event) => {
        fetchData(event)
    })
}

//Check if the current page is the Finnish version
const isFinnish = window.location.pathname.includes("fi")

//Handle form submission and send registation data to server
const fetchData = async (event) => {
    event.preventDefault()

    const formData = {
        email: event.target.email.value,
        password: event.target.password.value,
        username: event.target.username.value
    }

    try {
        //send POST request to register endpoint
        const response = await fetch("/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })

        if (!response.ok) {
            document.getElementById("error").innerText = "Error when trying to register. Please try again."
        } else {
            //redirect to the correct index page
            window.location.href = isFinnish ? "index-fi.html" : "index.html"
        }
    } catch (error) {
        console.log(`Error while trying to register: ${error.message}`)
    }
}

initializeRegister()
