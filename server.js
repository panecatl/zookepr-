const fs = require('fs');
const path = require('path');
const express = require('express');
// calling on data in the animals.json
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('public'));
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse iincoming json data
app.use(express.json());

// function to create a json from a query parameter
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];

    let filteredResults = animalsArray;

    // personality traits search
    if (query.personalityTraits) {
        // save personalityTraits as a dedicated array
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } 
        // if personalityTrait is a string, place it into a new array and save
        else {
            personalityTraitsArray = query.personalityTraits;
        }

        // loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            /* Remember, it is intially a copy of the animalsArray
            But we're updating it for each trait in the .forEach()
            For each trait being targeted, the filteredResults array
            will then contain only the entries that contain the trait
            Creates an array of animals that have every one of the traits when the 
            .forEach() loop is finished */
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }

    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

// function that takes id and array, but returns a single animal object
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id) [0];
    return result;
};

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    return animal;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

// route to animals.json
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

// route that accepts data to be used/stored on server side 
app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send 400 error
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted');
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});

// routing index to work with server.js
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`)
});