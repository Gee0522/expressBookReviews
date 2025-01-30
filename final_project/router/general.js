const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { userName, password } = req.body;

  // Validate if userName and password are provided
  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the user already exists
  const userExists = users.some((user) => user.userName === userName);

  if (userExists) {
    return res
      .status(409)
      .json({ message: `${userName} is already registered.` });
  }

  // Register the new user
  users.push({
    userName: userName,
    password: password,
  });

  return res
    .status(201)
    .json({ message: `${userName} has been successfully registered.` });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    if (!books) {
      return res.status(500).json({ message: "No books available." });
    }
    return res.status(200).json(books); // Send books data
  } catch (error) {
    console.error("Error fetching books:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving book list.", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving book", error: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const authorName = req.params.author;
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author === authorName
    );

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res
        .status(404)
        .json({ message: "No books found for the given author." });
    }
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving books.", error: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const bookTitle = req.params.title;
    const booksByTitle = Object.values(books).filter(
      (book) => book.title === bookTitle
    );

    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res
        .status(404)
        .json({ message: "No books found with the given title." });
    }
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving books", error: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn; // Extract the ISBN from the URL parameter

    if (!books[isbn]) {
      return res
        .status(404)
        .json({ message: "Book not found for the given ISBN." });
    }
    const bookReview = books[isbn].reviews;

    if (bookReview && Object.keys(bookReview).length > 0) {
      return res.status(200).json(bookReview);
    } else {
      return res
        .status(404)
        .json({ message: "No reviews available for this book." });
    }
  } catch (error) {
    console.error("Error fetching book reviews:", error.message);
    res
      .status(500)
      .json({ message: "Error retrieving reviews", error: error.message });
  }
});

module.exports.general = public_users;
