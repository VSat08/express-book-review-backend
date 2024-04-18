const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username, password) => {
    let existingUser = users.filter((user) => {
        return user.username === username
    })
    if (existingUser.length > 0) {
        return true;
    }
    else {
        return false;
    }
}


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User successfulyy registered!" });
        }
        else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.send(JSON.stringify(books, null, 4))
});
// Get the book list available in the shop: USING AXIOS
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get(books);
        const fetchedBook = response.data;
        return res.send(fetchedBook)

    }
    catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//     return res.send(books[req.params.isbn])
// });

// Get book details based on ISBN : USING AXIOS
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        // Use Axios to fetch book details from an external API
        const response = await axios.get(`https://satyam01v-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/`);

        // Check if the response is successful and contains book details
        if (response.status === 200 && response.data) {
            res.send(response.data[isbn]);
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        console.error("Error fetching book details:", error);
        res.status(500).send("Error fetching book details");
    }
});

// Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//     const fetchedBooks = Object.values(books).filter((book) => {
//         return book.author.toLocaleLowerCase().split(" ").join("") === req.params.author.toLocaleLowerCase().split(" ").join("")
//     })
//     res.send(fetchedBooks);
// });


// Get book details based on author : USING AXIOS
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author.toLowerCase();
        const response = await axios.get(`https://satyam01v-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/`);
        const fetchedBooks = response.data;
        const bookDetails = Object.values(fetchedBooks).filter((book) => {
            return book.author.toLocaleLowerCase().split(" ").join("") === req.params.author.toLocaleLowerCase().split(" ").join("")
        })
        res.send(bookDetails);
    } catch (error) {
        console.error('Error fetching books by author:', error);
        res.status(500).json({ error: 'Failed to fetch books by author' });
    }
});

// Get all books based on title
// public_users.get('/title/:title', function (req, res) {
//     const fetchedBooks = Object.values(books).filter((book) => {
//         return book.author.toLocaleLowerCase().split(" ").join("") === req.params.title.toLocaleLowerCase().split(" ").join("")
//     })
//     res.send(fetchedBooks);
// });


public_users.get('/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`https://satyam01v-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/`);
        const fetchedBooks = response.data;
        const bookDetails = Object.values(fetchedBooks).filter((book) => {
            return book.title.toLocaleLowerCase().split(" ").join("") === req.params.title.toLocaleLowerCase().split(" ").join("")
        })
        res.send(bookDetails);
    } catch (error) {
        console.error('Error fetching books by title:', error);
        res.status(500).json({ error: 'Failed to fetch books by title' });
    }
});










//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    res.send(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
