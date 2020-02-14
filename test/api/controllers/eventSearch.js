let mongoose = require("mongoose");
let Event = require('../../../api/models/Event');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();

let token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YWI2Y2Y3MmFhNzk0YzI5ZjgxNGMzNTEiLCJpc3MiOiJZb3VyVGFibGUiLCJpYXQiOjE1MjE5MzAwOTh9.5Z2fm_29hjgwogwvhy1CnUDNR1nXGWHUwEV08nHeccA';

chai.use(chaiHttp);

describe('Events Search', () => {

	describe('/GET /events/', () => {

	var id;

	it('it should create an event', (done) => {
		let event = {
			"yelpID": "congee-queen-mississauga",
			"title": "toronto",
			"description": "update",
			"purpose": "test1",
			"startTime": "2019-01-15T16:56:50.036Z",
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
		
	it('Try to find event with search -- toron', (done) => {
		chai.request(server)
		.get('/events/' + '?page=1&pageSize=10&radius=10000&search=toron')
		.end((err, res) => {
			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.events[0].should.have.property('yelpID').eql('congee-queen-mississauga');
			res.body.events[0].should.have.property('title').eql('toronto');
			res.body.events[0].should.have.property('description').eql('update');
			res.body.events[0].should.have.property('purpose').eql('test1');
			done();
			});
		});
		
	it('Try to find most recently created events with EMPTY search query', (done) => {
		chai.request(server)
		.get('/events/' + '?page=1&pageSize=10&radius=10000&search=')
		.end((err, res) => {
			res.should.have.status(200);
			res.body.events.should.be.a('array');
			res.body.events.length.should.be.eql(1);
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

