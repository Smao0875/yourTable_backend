let mongoose = require("mongoose");
let Event = require('../../../api/models/Event');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();

let token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YWI2Y2Y3MmFhNzk0YzI5ZjgxNGMzNTEiLCJpc3MiOiJZb3VyVGFibGUiLCJpYXQiOjE1MjE5MzAwOTh9.5Z2fm_29hjgwogwvhy1CnUDNR1nXGWHUwEV08nHeccA';

chai.use(chaiHttp);

describe('Events create/join based on distance or restaurant open time', () => {

	describe('/POST /events/', () => {

	var id;

	it('it should return error 400', (done) => {
	 let event = {
		  "yelpID": "congee-queen-mississauga",
		  "title": "first",
		  "description": "test",
		  "purpose": "test",
		  "startTime": "2018-01-15T14:56:50.036Z",  // Monday 09:56
		  "minAge": 11,
		  "maxAge": 22,
		  "capacity": 22,
		  "gender": "m",
		  "lng": 22,
		  "lat": 22
	 	};
		chai.request(server)
		.post('/events/')
		.set('Authorization', token)
		.send(event)
		.end((err, res) => {
			res.should.have.status(400);
		  	done();
			});
		});
		
	it('it should return error 400 because user cannot make it', (done) => {
		let event = {
				"yelpID": "congee-queen-mississauga",
				"title": "first",
				"description": "test",
				"purpose": "test",
				"startTime": "2018-03-26T16:56:50.036Z",  // Monday 11:56
				"minAge": 11,
				"maxAge": 22,
				"capacity": 22,
				"gender": "m",
				"lng": 22,
				"lat": 22
		};
		chai.request(server)
		.post('/events/')
		.set('Authorization', token)
		.send(event)
		.end((err, res) => {
			res.should.have.status(400);
			res.body.should.eql('Are you sure you can make it?');
			done();
			});
		});

	it('it should create an event', (done) => {
		let event = {
				"yelpID": "congee-queen-mississauga",
				"title": "first",
				"description": "test",
				"purpose": "test",
				"startTime": "2018-04-15T16:56:50.036Z",  // Monday 11:56
				"minAge": 11,
				"maxAge": 22,
				"capacity": 22,
				"gender": "m",
				"lng": -79,
				"lat": 43
		};
		chai.request(server)
		.post('/events/')
		.set('Authorization', token)
		.send(event)
		.end((err, res) => {
			id = res.body;
			res.should.have.status(200);
			done();
			});
		});
	
	it('it should fail to create an event which conflicts with existing upcoming event', (done) => {
		let event = {
				"yelpID": "dentistry-for-kids-and-adults-canyon-country",
				"title": "first",
				"description": "test",
				"purpose": "test",
				"startTime": "2018-04-15T17:56:50.036Z",  // Monday 11:56
				"minAge": 11,
				"maxAge": 22,
				"capacity": 22,
				"gender": "m",
				"lng": -118,
				"lat": 34
		};
		chai.request(server)
		.post('/events/')
		.set('Authorization', token)
		.send(event)
		.end((err, res) => {
			res.should.have.status(400);
			res.body.should.eql('Sorry, you have an upcoming event during that time.');
			done();
			});
		});

	it('Clean up test event', (done) => {
		chai.request(server)
		.delete('/events/' + id)
		.set('Authorization', token)
		.end((err, res) => {
			res.should.have.status(204);
			done();
			});
		});
	});
});

