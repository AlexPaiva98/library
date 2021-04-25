// Import: psql -U postgres -p 5432 -h 127.0.0.1 library < library.sql
// Export: pg_dump -U postgres -p 5432 -h 127.0.0.1 library > library.sql

const { Client } = require('pg');
const { geradorNome } = require('gerador-nome');

var library = new Client({
    user: 'postgres',
    password: 'homologacao',
    database: 'library'
});

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

function generateDate(startingYear, finalYear) {
    var date = new Date(
        getRandomIntInclusive(startingYear, finalYear),     /** Ano */
        getRandomIntInclusive(0, 11),                       /** Mês */
        getRandomIntInclusive(1, 31),                       /** Dia */
        getRandomIntInclusive(0, 23),                       /** Hora(s) */
        getRandomIntInclusive(0, 59),                       /** Minuto(s) */
        getRandomIntInclusive(0, 59)                        /** Segundo(s) */
    );
    return date.toISOString();
};

async function popularUser(total) {
    var email, name, i = 0;
    while (i < total) {
        email = `${geradorNome()}_${geradorNome()}@${SERVICES[getRandomIntInclusive(0, 2)]}.com`;
        name = `${geradorNome()} de ${geradorNome()}`;
        await library.query({
            text: 'INSERT INTO public."user"(email, name) VALUES($1, $2)',
            values: [email, name]
        }, (error, _) => {
            if (error) {
                console.log(`[user] Error in the insertion`);
            } else {
                console.log(`[user] Inserted`);
            }
        });
        i++;
    }
}

async function popularAuthor() {
    for (let i = 0; i < AUTHORS.length; i++) {
        await library.query({
            text: 'INSERT INTO public."author"(name) VALUES($1)',
            values: [AUTHORS[i]]
        }, (error, _) => {
            if (error) {
                console.log(`[author] Error in the insertion`);
            } else {
                console.log(`[author] Inserted`);
            }
        });
    }
}

async function popularPublishingHouse() {
    for (let i = 0; i < PUBLISHING_HOUSES.length; i++) {
        await library.query({
            text: 'INSERT INTO public."publisher"(company_name, cnpj) VALUES($1, $2)',
            values: [PUBLISHING_HOUSES[i].company_name, PUBLISHING_HOUSES[i].cnpj]
        }, (error, _) => {
            if (error) {
                console.log(`[publisher] Error in the insertion`);
            } else {
                console.log(`[publisher] Inserted`);
            }
        });
    }
}

async function popularTag() {
    for (let i = 0; i < TAGS.length; i++) {
        await library.query({
            text: 'INSERT INTO public."tag"(name) VALUES($1)',
            values: [TAGS[i]]
        }, (error, _) => {
            if (error) {
                console.log(`[tag] Error in the insertion`);
            } else {
                console.log(`[tag] Inserted`);
            }
        });
    }
}

async function popularCategory() {
    for (let i = 0; i < CATEGORIES.length; i++) {
        await library.query({
            text: 'INSERT INTO public."category"(name) VALUES($1)',
            values: [CATEGORIES[i]]
        }, (error, _) => {
            if (error) {
                console.log(`[category] Error in the insertion`);
            } else {
                console.log(`[category] Inserted`);
            }
        });
    }
}

async function popularBook(total) {
    for (let i = 0; i < total; i++) {
        await library.query('SELECT id FROM public."author" ORDER BY RANDOM() LIMIT 1', (e1, r1) => {
            if (e1) {
                console.log(e1.stack);
            } else {
                if (r1.rows[0]) {
                    var author_id = r1.rows[0].id;
                    library.query('SELECT id FROM public."publisher" ORDER BY RANDOM() LIMIT 1', (e2, r2) => {
                        if (e2) {
                            console.log(e2.stack);
                        } else {
                            if (r2.rows[0]) {
                                var publisher_id = r2.rows[0].id;
                                library.query('SELECT id FROM public."category" ORDER BY RANDOM() LIMIT 1', (e3, r3) => {
                                    if (e3) {
                                        console.log(e3.stack);
                                    } else {
                                        if (r3.rows[0]) {
                                            var isbn = `${getRandomIntInclusive(0, 999)}-${getRandomIntInclusive(0, 9)}-${getRandomIntInclusive(0, 9999)}-${getRandomIntInclusive(0, 9999)}-${getRandomIntInclusive(0, 9)}`;
                                            var title = `${TITLES[getRandomIntInclusive(0, 4)]} ${geradorNome()}`;
                                            var edition = getRandomIntInclusive(1, 3);
                                            var qtd_pages = getRandomIntInclusive(1, 999);
                                            var year_publication = getRandomIntInclusive(2000, 2021);
                                            var available = false;
                                            var category_id = r3.rows[0].id;
                                            library.query({
                                                text: 'INSERT INTO public."book"(isbn, title, edition, qtd_pages, year_publication, available, author_id, category_id, publisher_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                                                values: [
                                                    isbn,
                                                    title,
                                                    edition,
                                                    qtd_pages,
                                                    year_publication,
                                                    available,
                                                    author_id,
                                                    category_id,
                                                    publisher_id
                                                ]
                                            }, (e4, _) => {
                                                if (e4) {
                                                    console.log(`[book] Error in the insertion`);
                                                } else {
                                                    console.log(`[book] Inserted`);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}

async function popularBorrow() {
    await library.query('SELECT COUNT(*) AS len FROM public."book"', (e1, r1) => {
        if (e1) {
            console.log(e1.stack);
        } else {
            var len = r1.rows[0].len;
            for (let i = 0; i < getRandomIntInclusive(0, len); i++) {
                library.query('SELECT id FROM public."book" ORDER BY RANDOM() LIMIT 1', (e2, r2) => {
                    if (e2) {
                        console.log(e2.stack);
                    } else {
                        if (r2.rows[0]) {
                            var book_id = r2.rows[0].id;
                            library.query('SELECT id FROM public."user" ORDER BY RANDOM() LIMIT 1', (e3, r3) => {
                                if (e3) {
                                    console.log(e3.stack);
                                } else {
                                    if (r3.rows[0]) {
                                        var user_id = r3.rows[0].id;
                                        library.query({
                                            text: 'INSERT INTO public."borrow"(book_id, user_id, initial_date, final_date) VALUES($1, $2, $3, $4)',
                                            values: [
                                                book_id,
                                                user_id,
                                                generateDate(2018, 2018),
                                                generateDate(2019, 2019)
                                            ]
                                        }, (e4, _) => {
                                            if (e4) {
                                                console.log(`[borrow] Error in the insertion`);
                                            } else {
                                                console.log(`[borrow] Inserted`);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

async function popularBookTag(total) {
    for (let i = 0; i < total; i++) {
        await library.query('SELECT id FROM public."book" ORDER BY RANDOM() LIMIT 1', (e1, r1) => {
            if (e1) {
                console.log(e1.stack);
            } else {
                if (r1.rows[0]) {
                    var book_id = r1.rows[0].id;
                    library.query('SELECT id FROM public."tag" ORDER BY RANDOM() LIMIT 1', (e2, r2) => {
                        if (e2) {
                            console.log(e2.stack);
                        } else {
                            if (r2.rows[0]) {
                                var tag_id = r2.rows[0].id;
                                library.query({
                                    text: 'INSERT INTO public."book_tag"(book_id, tag_id) VALUES($1, $2)',
                                    values: [
                                        book_id,
                                        tag_id
                                    ]
                                }, (e3, _) => {
                                    if (e3) {
                                        console.log(`[book_tag] Error in the insertion`);
                                    } else {
                                        console.log(`[book_tag] Inserted`);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}

async function main() {
    await library.connect();
    await popularUser(10000);
    await popularAuthor();
    await popularPublishingHouse();
    await popularTag();
    await popularCategory();
    await popularBook(50000);
    await popularBookTag(500);
    await popularBorrow();
}

main();