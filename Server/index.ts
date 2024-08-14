import express from 'express';
import cors from 'cors';
import {BinaryIOBase} from '@Shared/interfaces';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./TestDb.db');

const app = express();
const port = 3002;

db.serialize(() => {
	db.run('CREATE TABLE IF NOT EXISTS ayaya_data (x INTEGER)');
	
	db.run(`CREATE TABLE IF NOT EXISTS binary_io 
		(
			id TEXT PRIMARY KEY, 
			state INTEGER NOT NULL,
			gateId TEXT,
			name TEXT NOT NULL,
			isGlobalIo BOOLEAN NOT NULL,
			parent TEXT NOT NULL,
			type TEXT NOT NULL CHECK(type IN ('input', 'output')),
			position TEXT,
			"to" TEXT,
			"from" TEXT
		)`
	)
})
app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
	res.json({ message: 'Hello, wssdsd!' });
});

app.get('/api/ayaya', (req, res) => {
	db.get('SELECT x FROM ayaya_data', (err:any, row:any) => {
		if(err){
			console.log(`error: ${err.message}`);
			return;
		}
		res.json({message: row});
	})
});

app.post(`/api/testPost`, (req, res) => {
	const binaryIO:BinaryIOBase = req.body satisfies BinaryIOBase;

	const stmt = db.prepare(`INSERT OR REPLACE INTO binary_io 
		(
			id,
			state,
			gateId,
			name,
			type,
			isGlobalIo,
			parent,
			position,
			"to",
			"from"
		) VALUES (?,?,?,?,?,?,?,?,?,?)`
	);
	stmt.run(
		binaryIO.id,
		binaryIO.state,
		binaryIO.gateId || null,
		binaryIO.name,
		binaryIO.type,
		binaryIO.isGlobalIo,
		binaryIO.parent,
		binaryIO.position || null,
		binaryIO.to,
		binaryIO.from || null
	);
	res.status(200).json('Succesfully inserted binaryIO');
})

app.get('/api/testGet',(req,res) => {
	console.log('called');
	const id = req.query.id;
	if(!id){
		res.status(401).json({error: 'ID required!'});
	}
	db.get('SELECT * FROM binary_io WHERE ID = ?', [id], (err:any, row:any) => {
		if(err){
			console.error(`${err.message}`);
			res.status(500).json({error: 'Db error'});
			return;
		}
		if(!row){
			console.error(`there is no row`);
			res.json({error: 'no row'});
			return;
		}
		res.status(200).json(row);
	})
})

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});