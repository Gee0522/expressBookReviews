const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (userName) => {
  //returns boolean

  console.log("Checking if user exists:", userName);
  return users.some(
    (user) => user.userName.toLowerCase() === userName.toLowerCase()
  );
};

const authenticatedUser = (userName, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  // Check if a user exists with the provided username and password
  return users.some(
    (user) => user.userName === userName && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  console.log("Received login request:", userName, password);

  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the username is valid and credentials match
  if (!isValid(userName)) {
    return res.status(404).json({ message: "User not found." });
  }

  if (!authenticatedUser(userName, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT access token
  let accessToken = jwt.sign({ userName }, "access", { expiresIn: 60 * 60 });
  console.log("Generated token:", accessToken);

  // Store the token in the session
  req.session.authorization = { accessToken };

  return res.status(200).send(`Welcome back ${userName}!`);
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  // Retrieve and verify the token
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, "access"); // Replace 'access' with your JWT secret
    const userName = decoded.userName;

    if (!userName) {
      return res
        .status(403)
        .json({ message: "Invalid token. User information not found." });
    }

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Add or update the review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[userName] = review;

    return res.status(200).json({
      message: "Review added/updated successfully.",
      reviews: books[isbn].reviews,
    });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Retrieve and verify the token
  const token = req.session.authorization?.accessToken;
  if (!token) {
    return res.status(403).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, "access");
    const userName = decoded.userName;

    if (!userName) {
      return res
        .status(403)
        .json({ message: "Invalid token. User information not found." });
    }

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Check if the review exists for the user
    if (books[isbn].reviews && books[isbn].reviews[userName]) {
      delete books[isbn].reviews[userName]; // Remove the review
      return res.status(200).json({
        message: "Review deleted successfully.",
        reviews: books[isbn].reviews, // Return the updated reviews object
      });
    } else {
      return res
        .status(404)
        .json({ message: "Review not found for this user." });
    }
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
