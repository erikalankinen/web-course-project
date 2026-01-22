//retrieve token from localStorage for authorization
let token = localStorage.getItem("token")

//check if the current page is Finnish version
const isFinnish = window.location.pathname.includes("index-fi.html")

//UI text translations
const TEXT = isFinnish ? {
    addColumn: "Lisää sarake",
    delete: "Poista",
    editName: "Muokkaa nimeä",
    addCard: "Lisää kortti",
    title: "Otsikko",
    content: "Sisältö",
    add: "Lisää",
    cardColor: "Kortin väri:",
    loginFailed: "Kirjautuminen epäonnistui",
    createColumnFailed: "Sarakkeen luonti epäonnistui",
    enterNewTitle: "Syötä uusi sarakkeen nimi:",
    renameFailed: "Sarakkeen uudelleennimeäminen epäonnistui",
    commentInput: "Lisää kommentti",
    commentFailed: "Kommentin lisääminen epäonnistui"
} : {
    addColumn: "Add column",
    delete: "Delete",
    editName: "Edit name",
    addCard: "Add card",
    title: "Title",
    content: "Content",
    add: "Add",
    cardColor: "Card color:",
    loginFailed: "Login failed",
    createColumnFailed: "Failed to create column",
    enterNewTitle: "Enter new column title:",
    renameFailed: "Failed to rename column",
    commentInput: "Add a comment",
    commentFailed: "Failed to add comment"
}

//function to load all columns and their cards
const loadColumns = async () => {
    const headers = token ? { "Authorization": "Bearer " + token } : {}
    const res = await fetch("/api/columns", { headers, method: "GET" })
    const data = await res.json()
    const container = document.getElementById("columns")
    container.innerHTML = ""

    //iterate over each column from backend
    data.forEach(column => {
        //create card element
        const card = document.createElement("div")
        card.className = "card z-depth-2 hoverable grey lighten-2"

        const contentDiv = document.createElement("div")
        contentDiv.className = "card-content"
        contentDiv.innerHTML = `
            <span class="card-title">${column.title}</span>
            <p class="grey-text text-darken-2">${new Date(column.updatedAt || column.createdAt).toLocaleString()}</p>
        `
        //container for action buttons
        const actionDiv = document.createElement("div")
        actionDiv.className = "card-action"
        actionDiv.style.marginTop = "auto"
        
        //delete button with API call
        const delBtn = document.createElement("button")
        delBtn.id = "deleteColumn"
        delBtn.textContent = TEXT.delete
        delBtn.className = "btn waves-effect waves-light"
        delBtn.addEventListener("click", async () => {
            const res = await fetch(`/api/column/${column._id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            const result = await res.json()
            if (res.ok) {
                loadColumns()
            } else {
                alert(result.message)
            }
        })

        //edit button to rename the column and API call
        const editBtn = document.createElement("button")
        editBtn.id = "editColumn"
        editBtn.style.marginRight = "10px"
        editBtn.textContent = TEXT.editName
        editBtn.className = "btn waves-effect waves-light"
        editBtn.addEventListener("click", async () => {
            const newTitle = prompt(TEXT.enterNewTitle, column.title)
            if (!newTitle) return

            const res = await fetch(`/api/column/${column._id}`, {
                method: "PUT",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({title: newTitle})
            })
            const r = await res.json()
            if (res.ok) {
                loadColumns()
            } else {
                alert(r.message || TEXT.renameFailed)
            }
        })

        //button to toggle showing a form to add a new card
        const addCardBtn = document.createElement("button")
        addCardBtn.style.marginRight = "10px"
        addCardBtn.textContent = TEXT.addCard
        addCardBtn.className = "btn waves-effect waves-light"

        //container for action buttons
        const actionButtons = document.createElement("div")
        actionButtons.appendChild(addCardBtn)
        actionButtons.appendChild(editBtn)
        actionButtons.appendChild(delBtn)

        actionDiv.appendChild(actionButtons)

        //form elements for adding a new card
        const cardForm = document.createElement("form")
        cardForm.style.display = "none"

        const title = document.createElement("input")
        title.type = "text"
        title.placeholder = TEXT.title
        title.required = true
        title.style.display = "block"

        const content = document.createElement("textarea")
        content.placeholder = TEXT.content
        content.classList.add("materialize-textarea")
        content.style.display = "block"

        const addBtn = document.createElement("button")
        addBtn.type = "submit"
        addBtn.textContent = TEXT.add
        addBtn.className = "btn waves-effect waves-light"

        const color = document.createElement("label")
        color.textContent = TEXT.cardColor
        color.style.display = "block"

        const colorsWrapper = document.createElement("div")
        colorsWrapper.style.display = "flex"
        const colors = ["#ffffff", "#ffccbc", "#c8e6c9", "#bbdefb", "#f8bbd0"]
        let selectedColor = "#ffffff"

        colors.forEach(c=> {
            const btn = document.createElement("div")
            btn.style.backgroundColor = c
            btn.style.width = "24px"
            btn.style.height = "24px"
            btn.style.cursor = "pointer"
            btn.style.border = "2px solid #ccc"
            btn.style.borderRadius = "50%"

            btn.addEventListener("click", () => {
                selectedColor = c
                Array.from(colorsWrapper.children).forEach(b => b.style.border = "2px solid #ccc")
                btn.style.border = "3px solid #000"
            })
            colorsWrapper.appendChild(btn)
        })

        cardForm.appendChild(title)
        cardForm.appendChild(content)
        cardForm.appendChild(color)
        cardForm.appendChild(colorsWrapper)
        cardForm.appendChild(addBtn)

        //toggle the add card form visibility
        addCardBtn.addEventListener("click", () => {
            const visible = cardForm.style.display === "block"
            cardForm.style.display = visible ? "none" : "block"
            actionButtons.style.display = visible ? "flex" : "none"
        })

        //submit event to send new card data to backend
        cardForm.addEventListener("submit", async (event) => {
            event.preventDefault()
            const cardTitle = title.value
            const cardContent = content.value

            const res = await fetch("/api/card", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    columnId: column._id,
                    title: cardTitle,
                    content: cardContent,
                    color: selectedColor
                })

            })
            if (res.ok) {
                loadColumns()
                cardForm.style.display = "none"
            } else {
                const data = await res.json()
                alert(data.message)
            }
        })

        //append form and content to the column card container
        actionDiv.appendChild(cardForm)
        card.appendChild(contentDiv)
        container.appendChild(card)

        //create container for cards in column
        const cardsL = document.createElement("div")
        cardsL.className = "card-list"

        //fetch cards of the column
        fetch (`/api/column/${column._id}/cards`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        }).then(res => res.json()).then(cards => {
            //sort cards by 'place' for ordering
            cards.sort((a,b)=>(a.place ?? 0)-(b.place ?? 0))
            .forEach(card => {
                //create card element for each card
                const cardElement = document.createElement("div")
                cardElement.className = "kanban-card z-depth-1"
                cardElement.draggable = true
                cardElement.style.backgroundColor = card.color || "#ffffff"
                cardElement.dataset.cardId = card._id
                cardElement.innerHTML = `
                    <strong>${card.title}</strong>
                    <p class="grey-text text-darken-2">${new Date(card.updatedAt || card.createdAt).toLocaleString()}</p>
                    <p>${card.content}</p>

                `
                //add form for comments
                const commentForm = document.createElement("form")
                const commentInput = document.createElement("input")
                commentInput.type = "text"
                commentInput.placeholder = TEXT.commentInput
                
                const commentBtn = document.createElement("button")
                commentBtn.type = "submit"
                commentBtn.textContent = TEXT.add

                commentForm.appendChild(commentInput)
                commentForm.appendChild(commentBtn)
                cardElement.appendChild(commentForm)

                //send comment to backend
                commentForm.addEventListener("submit", async (event) => {
                    event.preventDefault()
                    const text = commentInput.value
                    const res = await fetch(`/api/card/${card._id}/comment`, {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({text})
                    })

                    if (res.ok) {
                        loadColumns()
                        commentInput.value = ""
                    } else {
                        alert(TEXT.commentFailed)
                    }
                })

                card.comments.forEach(c => {
                    const commentL = document.createElement("div")
                    commentL.textContent = `${new Date(c.timestamp).toLocaleString()}: ${c.text}`
                    cardElement.appendChild(commentL)
                })
                
                //button to delete card
                const deleteBtn = document.createElement("button")
                deleteBtn.textContent = TEXT.delete
                deleteBtn.className = "btn-small red lighten-2 waves-effect waves-light"
                deleteBtn.style.marginTop = "8px"

                deleteBtn.addEventListener("click", async() => {
                    const res = await fetch(`/api/card/${card._id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    })

                    const result = await res.json()
                    if (res.ok) {
                        loadColumns()
                    } else {
                        alert(result.message)
                    }
                })
                cardElement.appendChild(deleteBtn)

                //enable drag-and-drop functionality for cards
                cardElement.addEventListener("dragstart", (event) => {
                    event.dataTransfer.setData("text/plain", card._id)
                })
                cardElement.addEventListener("dragenter", (event) => {
                    event.preventDefault()
                    cardElement.classList.add("drop-hover")
                })

                cardElement.addEventListener("dragleave", () => {
                    cardElement.classList.remove("drop-hover")
                })
                cardsL.appendChild(cardElement)
            })
        }).catch (err => {
            console.log("Error fetching cards", err)
        })
        card.appendChild(cardsL)
        card.appendChild(actionDiv)


        cardsL.addEventListener("dragover", (event) => {
            event.preventDefault()
        })

        cardsL.addEventListener("drop", async (event) => {
            event.preventDefault()
            const cardId = event.dataTransfer.getData("text/plain")
            const columnId = column._id
            const allCards = Array.from(cardsL.querySelectorAll(".kanban-card"))
            const dropTarget = event.target.closest(".kanban-card")
            let place = allCards.indexOf(dropTarget)
            if (place === -1 || event.target === cardsL) {
                place = allCards.length
            }
            const res = await fetch(`/api/card/${cardId}/move`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }, 
                body: JSON.stringify({columnId, place, updatedAt: new Date()})
            })
            if (res.ok) {
                loadColumns()
            } else {
                const data = await res.json()
                alert(data.message)
            }
        })


    })
}

//initialize the page
document.addEventListener("DOMContentLoaded", () => {

    //if token exists, load columns and cards
    if (token) {
        loadColumns()
    }

    //eventlistener to redirect to registration page
    const registerBtn = document.getElementById("register")
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            window.location.href = isFinnish ? "register-fi.html" : "register.html"
        })
    }

    const loginForm = document.getElementById("loginForm")
    const cardForm = document.getElementById("cardForm")
    const logoutBtn = document.getElementById("logout")

    const newColumnBtn = document.getElementById("newColumnBtn")
    newColumnBtn.style.marginTop = "15px"

    //hide column creation by default
    const columnFormContainer = document.getElementById("columnForm")

    columnFormContainer.style.display = "none"
    
    //login form submission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault()

        const email = document.getElementById("email").value
        const password = document.getElementById("password").value

        const res = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()
        console.log("Login response:", data)


        if (res.ok && data.token) {
            //save token and update UI after login
            localStorage.setItem("token", data.token)
            token = data.token
            if (loginForm) loginForm.style.display = "none"
            if (registerBtn) registerBtn.style.display = "none"
            if (logoutBtn) logoutBtn.style.display = "block"
            if (newColumnBtn) newColumnBtn.style.display = "block"
            await loadColumns()
            setTimeout(() => {
                window.location.href = isFinnish ? "index-fi.html" : "index.html"
            }, 100)
            
        } else {
            alert(data.message || TEXT.loginFailed)
        }
    })

    if (!token) {
        loginForm.style.display = "block"
        if (registerBtn) registerBtn.style.display = "block"
        logoutBtn.style.display = "none"
        newColumnBtn.style.display = "none"
        return
    }

    //verify token validity
    fetch("/api/private", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(async res => {
        const data = await res.json()
        if (!res.ok || !data.success) {
            //if token is invalid, remove it and update UI
            localStorage.removeItem("token")
            loginForm.style.display = "block"
            registerBtn.style.display = "block"
            newColumnBtn.style.display = "none"
            logoutBtn.style.display = "none"

        } else {
            //if valid, update UI
            loginForm.style.display = "none"
            registerBtn.style.display = "none"
            newColumnBtn.style.display = "block"            
            logoutBtn.style.display = "block"
            loadColumns()
        }
    })
    .catch(() => {
        //if error, assume token invalid and update UI
        localStorage.removeItem("token")
        loginForm.style.display = "block"
        registerBtn.style.display = "block"
        newColumnBtn.style.display = "none"
        logoutBtn.style.display = "none"
    })

    //logout button clears token and redirects to home page
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token")
        token = null
        window.location.href = isFinnish ? "index-fi.html" : "index.html"
      })
    }

    //create form for new columns
    const columnForm = document.createElement("form")
    columnForm.setAttribute("method", "post")

    const title = document.createElement("input")
    title.setAttribute("type", "text")
    title.setAttribute("id", "columnTitle")
    title.setAttribute("name", "title")
    title.setAttribute("placeholder", TEXT.title)

    const button = document.createElement("button")
    button.setAttribute("type", "submit")
    button.setAttribute("id", "addColumn")
    button.classList.add("btn", "waves-effect", "waves-light")
    button.textContent = TEXT.add

    columnForm.appendChild(title)
    columnForm.appendChild(button)

    columnFormContainer.appendChild(columnForm)

    //handle new column form submission
    columnForm.addEventListener("submit", async (event) => {
        event.preventDefault()
        const title = document.getElementById("columnTitle").value

        const res = await fetch("/api/column", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ title })
        })

        if (res.ok) {
            loadColumns()
            columnForm.reset()
            columnFormContainer.style.display = "none"

        } else {
            alert(TEXT.createColumnFailed)
        }

    })

    //toggle visibility of new column form
    newColumnBtn.addEventListener("click", () => {
        if (columnFormContainer.style.display === "none") {
            columnFormContainer.style.display = "block"
        } else {
            columnFormContainer.style.display = "none"
        }
    })

})

