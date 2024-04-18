const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
let validuser = users.filter((user)=>{
    return (user.username === username && user.password === password)
})
if(validuser.length>0){
    return true;
}
else{
    return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message:"Error logging in"});
  }
  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({
        data:password
    },'fingerprint_customer',{expiresIn:60*60});

    req.session.authorization = {
        accessToken,
        username
    }
    return res.status(200).send("User successfully logged in");
  }
  else{
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;
  
    // Get the book object by ISBN
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    // Check if the book has a 'reviews' property
    if (!book.reviews) {
      book.reviews = {};
    }
  
    const existingReview = book.reviews[username];
  
    if (existingReview) {
      existingReview.review = review;
      return res.status(200).json({ message: "Review updated successfully" });
    }
  
    book.reviews[username] = { username, review };
    return res.status(201).json({ message: "Review added successfully" });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    const book  = books[isbn];
    if(!book){
        return res.status(404).json({ message: "Book not found" });
    }
    if (!username) {
        return res.status(401).json({ message: "User not logged in" });
      }

      const userReview = book.reviews[username];
      if(!userReview){
        return res.status(404).json({ message: "User has not reviewed this book" });
      }

      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
