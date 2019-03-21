import React, { Component } from "react";

import {
  Grid,
  Row,
  Col,
  Button,
  ButtonToolbar,
  Form,
  DropdownButton,
  MenuItem,
  FormGroup,
  FormControl,
  Table
} from "react-bootstrap";
import logo from "./logo.svg";
import "./App.css";
import * as moment from "moment";
import config from "./config";
import uids from "./uids";

var firebase = require("firebase/app");
require("firebase/database");

firebase.initializeApp(config);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userNow: "Marni",
      value: "",
      tweets: [],
      loadingHere: true
    };
    this.onSelectUser = this.onSelectUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitTweet = this.submitTweet.bind(this);
    this.writeUserData = this.writeUserData.bind(this);
  }

  componentDidMount() {
    const tweetsRef = firebase.database().ref("/tweets");
    tweetsRef.on("value", snapshot => {
      const tweetsHere = snapshot.val();
      const newState = [];

      for (const tweet in tweetsHere) {
        if (tweet) {
          newState.push({
            id: tweet,
            date: tweetsHere[tweet].date,
            content: tweetsHere[tweet].content,
            user: tweetsHere[tweet].user
          });
        }
      }

      this.setState({
        tweets: newState,
        loadingHere: false
      });
    });
  }

  onSelectUser(eventKey) {
    //TODO: grab uid from firebase?
    const newUser = eventKey;
    this.setState({
      userNow: newUser
    });
  }

  getValidationState() {
    const length = this.state.value.length;
    if (length > 1 && length <= 240) return true;
    else return false;
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  submitTweet() {
    this.writeUserData(this.state.userNow, this.state.value);
    this.setState({
      userNow: "Choose a User",
      value: ""
    });
  }

  writeUserData(userNow, content) {
    let uid = uids[userNow];
    let newDate = new Date();

    var postData = {
      user: userNow,
      uid: uid,
      content: content,
      date: newDate
    };

    var newPostKey = firebase
      .database()
      .ref()
      .child("tweets")
      .push().key;
    var updates = {};

    updates["/tweets/" + newPostKey] = postData;
    updates["/users/" + uid + "/tweets/" + newPostKey] = postData;

    return firebase
      .database()
      .ref()
      .update(updates, function(error) {
        if (error) {
          console.log("error");
        } else {
          console.log("no error; data saved ok");
        }
      });
  }

  render() {
    const { userNow, value, tweets } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Tweetable Tuzag Test</h1>
        </header>
        <Grid>
          <Row className="show-grid">
            <Col xs={12} md={12}>
              <p className="App-intro">To tweet, please choose a user:</p>
            </Col>

            <DropdownButton
              bsSize="large"
              title={userNow}
              id="dropdown-size-large"
            >
              <MenuItem eventKey="Max" onSelect={this.onSelectUser}>
                Max
              </MenuItem>
              <MenuItem eventKey="Dave" onSelect={this.onSelectUser}>
                Dave
              </MenuItem>
              <MenuItem eventKey="Marni" onSelect={this.onSelectUser}>
                Marni
              </MenuItem>
              <MenuItem eventKey="Sarah" onSelect={this.onSelectUser}>
                Sarah
              </MenuItem>
            </DropdownButton>

            <Form className="dataForm">
              <FormGroup controlId="formBasicText">
                <FormControl
                  type="text"
                  value={value}
                  placeholder="Enter tweet"
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <Button
                  className="tweetButton"
                  bsStyle="primary"
                  disabled={!this.getValidationState()}
                  onClick={this.submitTweet}
                >
                  Tweet
                </Button>
              </FormGroup>
            </Form>

            <Table striped bordered condensed hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tweet</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tweets.map((tweet, i) => {
                  let formattedDate = moment(tweet.date).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  );
                  return (
                    <tr key={i}>
                      <td>{tweet.user}</td>
                      <td>{tweet.content}</td>
                      <td>{formattedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
