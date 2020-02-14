let mongoose = require("mongoose");
let Event = require('../../../api/models/Event');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();

let token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YWI2Y2Y3MmFhNzk0YzI5ZjgxNGMzNTEiLCJpc3MiOiJZb3VyVGFibGUiLCJpYXQiOjE1MjE5MzAwOTh9.5Z2fm_29hjgwogwvhy1CnUDNR1nXGWHUwEV08nHeccA';

chai.use(chaiHttp);


describe('Event', () => {
	
	describe('/POST /events/', () => {
	  
	var id;

	it('it should return error 401 because of bad token', (done) => {
	 let event = {
		  "yelpID": "02",
		  "title": "test",
		  "description": "test",
		  "purpose": "test",
		  "startTime": "22",
		  "minAge": 11,
		  "maxAge": 22,
		  "capacity": 22,
		  "gender": "m",
		  "lng": 22,
		  "lat": 22
	 };
		chai.request(server)
		.post('/events/')
		.set('Authorization', token + 'bad') // bad token
		.send(event)
		.end((err, res) => {
			res.should.have.status(401);
		  done();
			});
		});
	
	it('it should return error 400 because of missing yelpID', (done) => {
	 let event = {
		  //"yelpID": "01",
		  "title": "test",
		  "description": "test",
		  "purpose": "test",
		  "startTime": "22",
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
			res.body.should.eql('Missing field: yelpID');
		  done();
			});
		});
		
		
	it('it should return error 400 because of missing location info', (done) => {
	 let event = {
		  "yelpID": "02",
		  "title": "test",
		  "description": "test",
		  "purpose": "test",
		  "startTime": "22",
		  "minAge": 11,
		  "maxAge": 22,
		  "capacity": 22,
		  "gender": "m",
		  "lng": 22,
		  //"lat": 22
	 };
		chai.request(server)
		.post('/events/')
		.set('Authorization', token)
		.send(event)
		.end((err, res) => {
			res.should.have.status(400);
			res.body.should.eql('Missing location info');
		  done();
			});
		});
	
	it('it should create an event', (done) => {
         let event = {
			  "yelpID": "congee-queen-mississauga",
			  "title": "test",
			  "description": "test",
			  "purpose": "test",
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
	  
	it('it should get an specific event', (done) => {
		chai.request(server)
		.get('/events/' + id)
		.end((err, res) => {
			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.events[0].should.have.property('yelpID').eql('congee-queen-mississauga');
			res.body.events[0].should.have.property('title').eql('test');
			res.body.events[0].should.have.property('description').eql('test');
			res.body.events[0].should.have.property('purpose').eql('test');
			done();
			});
		});
	
	it('it should update an event and return 204', (done) => {
		chai.request(server)
		.put('/events/' + id)
		.set('Authorization', token)
		.send({"title": "update",
			  "description": "update",
			  "purpose": "update",
			  "minAge": 11,
			  "maxAge": 22})
		.end((err, res) => {
			res.should.have.status(204);
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

	it('Make sure test event is deleted', (done) => {
		chai.request(server)
		.get('/events/' + id)
		.end((err, res) => {
			res.should.have.status(200);
			res.body.should.be.a('object');
			res.body.events[0].should.have.property('isDeleted').eql(true);
			done();
			});
		});
	});
});

