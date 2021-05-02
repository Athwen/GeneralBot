const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { json } = require('express');
require('dotenv').config();
const path = require('path');
const port = process.env.PORT || 5000;

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(express.json());


// firebase stuff
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const endPoints = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
for(const file of endPoints) {
	const api = require(`./api/${file}`);
	api.setApp(app);

}

if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('frontend/build'));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
	});
}

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS',
	);
	next();
});


const server = app.listen(port, () => {
	console.log(`Server listening at onp port: ${port}`);

});

module.exports = {
	db: db,
};