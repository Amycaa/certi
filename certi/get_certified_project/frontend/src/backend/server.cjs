const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'get_certified'
});

// 1. GET /api/people – összes személy vezetéknév, keresztnév szerint ABC sorrendben
app.get('/api/people', (req, res) => {
    conn.query('SELECT * FROM people ORDER BY last_name ASC, first_name ASC', (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a személyek lekérdezésében' });
        }
        res.json(results);
    });
});

// 2. GET /api/certifications – összes tanúsítvány név szerint ABC sorrendben
app.get('/api/certifications', (req, res) => {
    conn.query('SELECT * FROM certifications ORDER BY name ASC', (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a tanúsítványok lekérdezésében' });
        }
        res.json(results);
    });
});

// 3. GET /api/attempts/person/:person_id – egy személy összes kísérlete, tanúsítvány és szolgáltató névvel
app.get('/api/attempts/person/:person_id', (req, res) => {
    const { person_id } = req.params;
    const sql = `
        SELECT
            a.id               AS attempt_id,
            a.person_id,
            p.first_name,
            p.last_name,
            a.certification_id,
            c.name             AS certification_name,
            pr.name            AS provider_name,
            a.start_datetime,
            a.end_datetime,
            a.percentage,
            a.is_passed,
            a.previous_attempt_id,
            a.next_attempt_id
        FROM attempts a
        JOIN people p         ON a.person_id        = p.id
        JOIN certifications c ON a.certification_id = c.id
        JOIN providers pr     ON c.provider_id      = pr.id
        WHERE a.person_id = ?
        ORDER BY a.start_datetime DESC`;
    conn.query(sql, [person_id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a kísérletek lekérdezésében' });
        }
        res.json(results);
    });
});

// 4. GET /api/attempts/certification/:certification_id – egy tanúsítvány összes kísérlete
app.get('/api/attempts/certification/:certification_id', (req, res) => {
    const { certification_id } = req.params;
    const sql = `
        SELECT
            a.id               AS attempt_id,
            a.person_id,
            CONCAT(p.first_name, ' ', p.last_name) AS full_name,
            a.certification_id,
            c.name             AS certification_name,
            pr.name            AS provider_name,
            a.start_datetime,
            a.end_datetime,
            a.percentage,
            a.is_passed
        FROM attempts a
        JOIN people p         ON a.person_id        = p.id
        JOIN certifications c ON a.certification_id = c.id
        JOIN providers pr     ON c.provider_id      = pr.id
        WHERE a.certification_id = ?
        ORDER BY a.start_datetime DESC`;
    conn.query(sql, [certification_id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a kísérletek lekérdezésében' });
        }
        res.json(results);
    });
});

// 5. GET /api/search/:searchedWord – keresés tanúsítvány neve vagy szolgáltató neve alapján
app.get('/api/search/:searchedWord', (req, res) => {
    const word = `%${req.params.searchedWord}%`;
    const sql = `
        SELECT
            a.id               AS attempt_id,
            CONCAT(p.first_name, ' ', p.last_name) AS person_name,
            a.certification_id,
            c.name             AS certification_name,
            pr.name            AS provider_name,
            a.start_datetime,
            a.end_datetime,
            a.percentage,
            a.is_passed
        FROM attempts a
        JOIN people p         ON a.person_id        = p.id
        JOIN certifications c ON a.certification_id = c.id
        JOIN providers pr     ON c.provider_id      = pr.id
        WHERE c.name  LIKE ?
           OR pr.name LIKE ?
           OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?
        ORDER BY a.start_datetime DESC`;
    conn.query(sql, [word, word, word], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a keresésben' });
        }
        res.json(results);
    });
});

// 6. PATCH /api/update-attempt – kísérlet módosítása id alapján
// Body: { id, end_datetime?, percentage?, is_passed?, previous_attempt_id?, next_attempt_id? }
app.patch('/api/update-attempt', (req, res) => {
    const { id, end_datetime, percentage, is_passed, previous_attempt_id, next_attempt_id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Az id megadása kötelező' });
    }

    const fields = [];
    const values = [];

    if (end_datetime         !== undefined) { fields.push('end_datetime = ?');         values.push(end_datetime); }
    if (percentage           !== undefined) { fields.push('percentage = ?');           values.push(percentage); }
    if (is_passed            !== undefined) { fields.push('is_passed = ?');            values.push(is_passed); }
    if (previous_attempt_id  !== undefined) { fields.push('previous_attempt_id = ?');  values.push(previous_attempt_id); }
    if (next_attempt_id      !== undefined) { fields.push('next_attempt_id = ?');      values.push(next_attempt_id); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'Nincs módosítandó adat' });
    }

    values.push(id);
    const sql = `UPDATE attempts SET ${fields.join(', ')} WHERE id = ?`;

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a kísérlet módosításában' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Nem található ilyen kísérlet' });
        }
        res.json({ message: 'Sikeresen módosítva.', affectedRows: results.affectedRows });
    });
});

// 7. POST /api/attempts – új vizsgakísérlet felvétele
// Body: { person_id, certification_id, start_datetime, end_datetime?, percentage?, is_passed?, previous_attempt_id?, next_attempt_id? }
app.post('/api/attempts', (req, res) => {
    const { person_id, certification_id, start_datetime, end_datetime, percentage, is_passed, previous_attempt_id, next_attempt_id } = req.body;

    if (!person_id || !certification_id) {
        return res.status(400).json({ error: 'person_id és certification_id megadása kötelező' });
    }

    const sql = `
        INSERT INTO attempts
            (person_id, certification_id, start_datetime, end_datetime, percentage, is_passed, previous_attempt_id, next_attempt_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    conn.query(sql, [
        person_id,
        certification_id,
        start_datetime || null,
        end_datetime || null,
        percentage !== undefined ? percentage : null,
        is_passed !== undefined ? is_passed : null,
        previous_attempt_id || null,
        next_attempt_id || null
    ], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a kísérlet felvételében' });
        }
        res.status(201).json({ message: 'Vizsgakísérlet sikeresen felvéve.', id: results.insertId });
    });
});

// 8. DELETE /api/attempts – kísérlet törlése
// Body: { id }
app.delete('/api/attempts', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Az id megadása kötelező' });
    }

    conn.query('DELETE FROM attempts WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Hiba a kísérlet törlésében' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Nem található ilyen kísérlet' });
        }
        res.json({ message: 'Vizsgakísérlet sikeresen törölve.', affectedRows: results.affectedRows });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
