const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();

// calling on data in the animals.json
const { animals } = require('./data /animals.json');

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

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`)
});