const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

  const { userName, password } = req.body;

  // Validate if userName and password are provided
  if (!userName || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user already exists
  const userExists = users.some(user => user.userName === userName);

  if (userExists) {
    return res.status(409).json({ message: `${userName} is already registered.` });
  }

  // Register the new user
  users.push({
    userName: userName,
    password: password,
  });

  return res.status(201).json({ message: `${userName} has been successfully registered.` })

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  
  
  if(!books) {
    res.status(500).json({message: "no books", error});
  }
  else{
    res.send(JSON.stringify(books))
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    // If the book is found, send its details as a response
    res.status(200).json(book);
  } else {
    // If the book is not found, send a 404 response
    res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
  const authorName = req.params.author; // Extract the 'author' parameter
  const booksByAuthor = [];

  // Loop through the books to find matching authors
  for (const author in books) {
    if (books[author].author === authorName) {
      booksByAuthor.push(books[author]); // Add matching book to the result
    }
  }

  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor); // Send the books as JSON
  } else {
    res.status(404).json({ message: "No books found for the given author" });
  }

  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

  const bookTitle = req.params.title; // Extract the 'title' parameter from the request
  const booksByTitle = [];

  // Loop through the books object to find matching titles
  for (const bookKey in books) {
    if (books[bookKey].title && books[bookKey].title === bookTitle) {
      booksByTitle.push(books[bookKey]); // Add matching book to the result
    }
  }

  // Check if any books were found
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle); // Send the matching books as JSON
  } else {
    res.status(404).json({ message: "No books found with the given title." });
  }
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  
  const isbn = req.params.isbn; // Extract the ISBN from the URL parameter

  if (books[isbn]) {
    const bookReview = books[isbn].reviews; // Assuming books[isbn] has a 'reviews' property
    if (bookReview) {
      res.status(200).json(bookReview); // Return the reviews as JSON
    } else {
      res.status(404).json({ message: "No reviews available for this book." });
    }
  } else {
    res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});

module.exports.general = public_users;
