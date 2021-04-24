const Mongo = require('./model/MongoDB');
const { geradorNome } = require('gerador-nome');

var mongo = new Mongo("mongodb://localhost:27017?useUnifiedTopology=true");
var users = [];     /** Email list */
var books = [];     /** ISBN list */
var borrowed = [];  /** ISBN list */

const SERVICES = [
    'gmail', 
    'outlook', 
    'yahoo'
];
const TITLES = [
    'As aventuras de ',
    'Uma história por',
    'Conheça ',
    'Vivendo e aprendendo com',
    'Nada além de '
];
const AUTHORS = [
    'José Saramago',
    'Clarice Lispector',
    'Edgar Allan Poe',
    'Fiódor Dostoiévski',
    'William Shakespeare',
    'Marcel Proust',
    'Miguel de Cervantes',
    'Gabriel García Márquez',
    'Franz Kafka',
    'Jorge Luis Borges'
];
const PUBLISHING_HOUSES = [
    {
        company_name: 'Companhia da Letras',
        cnpj: '55.789.390/0008-99'
    },
    {
        company_name: 'Aleph',
        cnpj: '53.523.551/0001-04'
    },
    {
        company_name: 'Suma',
        cnpj: '90.375.049/0001-11'
    },
    {
        company_name: 'Intrínseca',
        cnpj: '05.660.045/0001-06'
    },
    {
        company_name: 'Rocco',
        cnpj: '42.444.703/0004-00'
    }
];

const CATEGORIES = [
    'Romance',
    'Drama',
    'Novela',
    'Conto',
    'Crônica',
    'Ensaio',
    'Poesia',
    'Memórias',
    'Biografia',
    'Aventura'
];
const TAGS = [
    'superação', 
    'motivação', 
    'aprendizado', 
    'conduta', 
    'viagem'
];

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDate() {
    var date = new Date(
        getRandomIntInclusive(2000, 2021),    /** Ano */
        getRandomIntInclusive(0, 11),         /** Mês */
        getRandomIntInclusive(1, 31),         /** Dia */
        getRandomIntInclusive(0, 23),         /** Hora(s) */
        getRandomIntInclusive(0, 59),         /** Minuto(s) */
        getRandomIntInclusive(0, 59)          /** Segundo(s) */
    );
    return date.toISOString();
};

function generateBorrow() {
    var len = getRandomIntInclusive(0, borrowed.length - 1);
    var array = [];
    for (let i = 0; i < len; i++) {
        let indexISBN = getRandomIntInclusive(0, borrowed.length - 1);
        array.push({
            isbn: borrowed[indexISBN],
            initial_date: generateDate(),
            final_date: null
        });
        borrowed.splice(indexISBN, 1);
    }
    return array;
}

function generateUser() {
    var email;
    while (true) {
        email = `${geradorNome()}_${geradorNome()}@${SERVICES[getRandomIntInclusive(0, 2)]}.com`;
        if (users.findIndex(item => item === email) === -1) {
            users.push(email);
            return {
                email,
                name: `${geradorNome()} de ${geradorNome()}`,
                borrow: generateBorrow()
            };
        }
    }
}

function generateTags() {
    var len = getRandomIntInclusive(0, 5);
    var array = [];
    for (let i = 0; i < len; i++) {
        array.push(TAGS[getRandomIntInclusive(0, 4)]);
    }
    /** Remove repetitions */
    return array.filter((item, index) => array.indexOf(item) === index);
}

function generateBook() {
    var isbn;
    while (true) {
        isbn = `${getRandomIntInclusive(0, 999)}-${getRandomIntInclusive(0, 9)}-${getRandomIntInclusive(0, 9999)}-${getRandomIntInclusive(0, 9999)}-${getRandomIntInclusive(0, 9)}`;
        if (books.findIndex(item => item === isbn) === -1) {
            let available = getRandomIntInclusive(0, 1) ? true : false;
            if (available) {
                borrowed.push(isbn);
            }
            books.push(isbn);
            return {
                isbn,
                title: `${TITLES[getRandomIntInclusive(0, 4)]} ${geradorNome()}`,
                author: AUTHORS[getRandomIntInclusive(0, 9)],
                publishing_house: PUBLISHING_HOUSES[getRandomIntInclusive(0, 4)],
                category: CATEGORIES[getRandomIntInclusive(0, 9)],
                tags: generateTags(),
                edition: getRandomIntInclusive(1, 3),
                qtd_pages: getRandomIntInclusive(1, 999),
                year_publication: getRandomIntInclusive(2000, 2021),
                available
            };
        }
    }
}

async function popular(database, collection, generator, total, batchSize) {
    await mongo.connect();
    var it = Math.floor(total / batchSize);
    for (let i = 0; i < it; i++) {
        var batch = [];
        for (j = 0; j < batchSize; j++) {
            batch.push(generator());
        }
        console.log(`${collection} Inserting batch ${i + 1} of ${it}. Batch size is ${batch.length}`);
        var hrstart = process.hrtime();
        await mongo.insertMany(database, collection, batch);
        console.log(`${collection} Inserted in %dms`, process.hrtime(hrstart)[1] / 1000000);
    }
    await mongo.close();
}

async function main() {
    await popular('library', 'book', generateBook, 500000, 10000);
    await popular('library', 'user', generateUser, 100000, 10000);
    console.log('Completed process');
};

main();