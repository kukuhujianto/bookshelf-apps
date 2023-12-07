let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved_book';
const STORAGE_KEY = 'BOOK_APPS'

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id, title, author, year, isCompleted
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const bookIsCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(Number(bookId));
  if (bookTarget == null) return;

  const editTitle = document.getElementById('editBookTitle').value;
  const editAuthor = document.getElementById('editBookAuthor').value;
  const editYear = document.getElementById('editBookYear').value;
  const isCompleted = document.getElementById('editBookIsComplete').checked;

  bookTarget.title = editTitle;
  bookTarget.author = editAuthor;
  bookTarget.year = editYear;
  bookTarget.isCompleted = isCompleted;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBooks() {
  const bookTitle = document.getElementById('searchBookTitle').value;
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);
  const searchedBooks = data.filter(function (book) {
    return book.title.toLowerCase().includes(bookTitle);
  });
  if (searchedBooks.length === 0) {
    alert('Buku tidak ditemukan!');
    return location.reload();
  }
  if (bookTitle !== '') {
    for (const book of searchedBooks) {
      books = [];
      books.push(book);
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    books = [];
    loadDataFromStorage();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchForm = document.getElementById('searchBook')
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function finishedRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function unfinishedRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveBook (bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = 'Penulis : ' + bookObject.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = 'Tahun : ' + bookObject.year;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');

  if (bookObject.isCompleted) {
    const greenButton = document.createElement('button');
    greenButton.classList.add('green');
    greenButton.innerText = 'Belum Selesai Dibaca';

    greenButton.addEventListener('click', function () {
      unfinishedRead(bookObject.id);
    });

    const redButton = document.createElement('button');
    redButton.classList.add('red');
    redButton.innerText = 'Hapus Buku';

    redButton.addEventListener('click', function () {
      deleteBook(bookObject.id);
    });

    buttonContainer.append(greenButton, redButton);

  } else {
    const greenButton = document.createElement('button');
    greenButton.classList.add('green');
    greenButton.innerText = 'Selesai Dibaca';

    greenButton.addEventListener('click', function () {
      finishedRead(bookObject.id);
    })

    const redButton = document.createElement('button');
    redButton.classList.add('red');
    redButton.innerText = 'Hapus Buku';

    redButton.addEventListener('click', function () {
      deleteBook(bookObject.id);
    });

    buttonContainer.append(greenButton, redButton);
  }

  const editButton = document.createElement('button');
  editButton.classList.add('blue');
  editButton.innerText = 'Edit Buku';

  editButton.addEventListener('click', function () {
    const editForm = document.getElementById('editBook');
    const bookId = this.closest('.book_item').id;
    const bookTarget = findBook(Number(bookId));

    const bookTitle = document.getElementById('editBookTitle');
    const bookAuthor = document.getElementById('editBookAuthor');
    const bookYear = document.getElementById('editBookYear');
    const bookIsCompleted = document.getElementById('editBookIsComplete');
    const bookSubmit = document.getElementById('bookSubmit');

    bookId == bookTarget.id;
    bookTitle.value = bookTarget.title;
    bookAuthor.value = bookTarget.author;
    bookYear.value = bookTarget.year;
    bookIsCompleted.checked = bookTarget.isCompleted;

    editForm.addEventListener('submit', function (event) {
      event.preventDefault();
      editBook(bookId);
      editForm.reset();
      bookTitle.setAttribute('disabled', 'disabled');
      bookAuthor.setAttribute('disabled', 'disabled');
      bookYear.setAttribute('disabled', 'disabled');
      bookIsCompleted.setAttribute('disabled', 'disabled');
      bookSubmit.setAttribute('disabled', 'disabled');
    })

    bookTitle.removeAttribute('disabled')
    bookAuthor.removeAttribute('disabled');
    bookYear.removeAttribute('disabled');
    bookIsCompleted.removeAttribute('disabled');
    bookSubmit.removeAttribute('disabled');
  })

  buttonContainer.append(editButton);

  const container = document.createElement('article');
  container.classList.add('book_item');
  container.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  container.setAttribute('id', `${bookObject.id}`);

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBooks = document.getElementById('incompleteBookshelfList');
  incompletedBooks.innerHTML = '';

  const completedBooks = document.getElementById('completeBookshelfList');
  completedBooks.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = saveBook(bookItem);

    if (bookItem.isCompleted) {
      completedBooks.append(bookElement);
    } else {
      incompletedBooks.append(bookElement);
    }
  }
});