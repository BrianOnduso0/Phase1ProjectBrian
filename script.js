document.addEventListener('DOMContentLoaded', function () {
    const contentDiv = document.getElementById('content');
    const searchInput = document.getElementById('searchInput');
    const addBookButton = document.getElementById('addBookButton');
    const reportButton = document.getElementById('reportButton');
    let books = [];

    fetch('db.json')
        .then(response => response.json())
        .then(data => {

            books = data.books.map(book => ({
                ...book,
                borrowedHistory: [],
                returnedHistory: [],
                initialQuantity: book.quantity
            }));
            displayBooks(books);
        })
        .catch(error => console.error('Error fetching data:', error));


    function displayBooks(booksArray) {
        contentDiv.innerHTML = '';
        booksArray.forEach(book => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book');
            bookDiv.innerHTML = `
                <h2>${book.title}</h2>
                <p>Author: ${book.author}</p>
                <p>Quantity: ${book.quantity}</p>
                <button class="borrowButton" data-id="${book.id}" ${book.quantity === 0 ? 'disabled' : ''}>Borrow</button>
                <button class="returnButton" data-id="${book.id}" ${book.borrowedHistory.length === 0 || book.quantity === book.initialQuantity ? 'disabled' : ''}>Return</button>
                <button class="editButton" data-id="${book.id}">Edit</button>
                <button class="deleteButton" data-id="${book.id}">Delete</button>
                <hr>
            `;
            contentDiv.appendChild(bookDiv);
        });
    }

    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
        displayBooks(filteredBooks);
    }

    function addBook() {
        const titleInput = document.getElementById('titleInput').value;
        const authorInput = document.getElementById('authorInput').value;
        const quantityInput = parseInt(document.getElementById('quantityInput').value);

        if (!titleInput || !authorInput || isNaN(quantityInput) || quantityInput < 1) {
            alert('Please fill in title, author and valid quantity fields.');
            return;
        }

        const newBook = {
            id: books.length + 1, 
            title: titleInput,
            author: authorInput,
            quantity: quantityInput,
            borrowedHistory: [],
            returnedHistory: [],
            initialQuantity: quantityInput 
        };
        books.push(newBook);

    
        document.getElementById('titleInput').value = '';
        document.getElementById('authorInput').value = '';
        document.getElementById('quantityInput').value = '';

        
        displayBooks(books);
    }

    
    addBookButton.addEventListener('click', addBook);


    searchInput.addEventListener('input', filterBooks);

    function borrowBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1 && books[bookIndex].quantity > 0) {
            books[bookIndex].quantity--;
            books[bookIndex].borrowedHistory.push(new Date());
            displayBooks(books);
            alert(`Book with ID ${bookId} borrowed. Remaining quantity: ${books[bookIndex].quantity}`);
        } else {
            alert('No books available to borrow.');
        }
    }

    function returnBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            const book = books[bookIndex];
            books[bookIndex].quantity++;
            books[bookIndex].returnedHistory.push(new Date());
            displayBooks(books);
            alert(`Book with ID ${bookId} returned. Remaining quantity: ${books[bookIndex].quantity}`);
        }
    }


    function editBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            const book = books[bookIndex];

            const newTitle = prompt('Enter New Title', book.title);
            const newAuthor = prompt('Enter New Author', book.author);
            const newQuantity = parseInt(prompt('Enter New Quantity', book.quantity));

            if (newTitle && newAuthor && !isNaN(newQuantity) && newQuantity >= 0) {
                
                books[bookIndex].title = newTitle;
                books[bookIndex].author = newAuthor;
                books[bookIndex].quantity = newQuantity;
                displayBooks(books);
                alert(`Book with ID ${bookId} updated`);
            } else {
                alert('Invalid Entry please Try Again');
            }
        } else {
            alert('Book not found.');
        }
    }


    function deleteBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            books.splice(bookIndex, 1);
            displayBooks(books);
            alert(`Book with ID ${bookId} deleted.`);
        }
    }

    function generateReport() {
        const borrowedBooks = books.filter(book => book.borrowedHistory.length > 0);
        const reportContent = borrowedBooks.map(book => {
            return `
                <div>
                    <p>Title: ${book.title}</p>
                    <p>Author: ${book.author}</p>
                    <p>Borrowed Dates: ${book.borrowedHistory.join(', ')}</p>
                    <p>Returned Dates: ${book.returnedHistory.join(', ')}</p>
                </div>
                <hr>
            `;
        }).join('')

        console.log(document.getElementById('reportContent'))


        document.getElementById('reportContent').innerHTML = reportContent;
        document.getElementById('myModal').style.display = "block";
    }

    
    var modal = document.getElementById('myModal');
 
    var span = document.getElementsByClassName("close")[0];

    span.onclick = function () {
        modal.style.display = "none";
    }
  
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    contentDiv.addEventListener('click', function (event) {
        if (event.target.classList.contains('borrowButton')) {
            const bookId = parseInt(event.target.dataset.id);
            borrowBook(bookId);
        } else if (event.target.classList.contains('returnButton')) {
            const bookId = parseInt(event.target.dataset.id);
            returnBook(bookId);
        } else if (event.target.classList.contains('editButton')) {
            const bookId = parseInt(event.target.dataset.id)
            editBook(bookId)
        } else if (event.target.classList.contains('deleteButton')) {
            const bookId = parseInt(event.target.dataset.id);
            deleteBook(bookId);
        }
    });

    reportButton.addEventListener('click', generateReport);

});
