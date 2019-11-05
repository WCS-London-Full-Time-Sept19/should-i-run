import React from "react";
import Button from "./Button";
import "../styles/Controls.css";
import { notifyUser, getgeoNotificationStatus } from "../utilities/math";

class Session extends React.Component {
  // initialise component state
  state = {
    timer: {
      hours: 0,
      minutes: 0,
      seconds: 0
    },
    sentMessages: {
      headback: false,
      ifYouRun: false,
      tooLate: false
    }
  };

  // initialize the intervalID (this is used to clear the interval)
  intervalID = 0;

  // calculate and format the countdown timer, and set as state
  calcTimer(expiryTime) {
    // dispatch messages if required
    this.dispatchMessages();

    let remainingTime, currentTime, hours, minutes, seconds;
    this.intervalID = setInterval(() => {
      currentTime = Date.now();
      // get the time remaining in milliseconds
      remainingTime = expiryTime - currentTime;

      // stop the timer when time runs out
      if (expiryTime <= currentTime) {
        clearInterval(this.intervalID);
      }

      // get the hours, minutes and seconds from milliseconds
      seconds = Math.floor((remainingTime / 1000) % 60);
      minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);

      // format the hours, minutes and seconds for display
      seconds = seconds < 10 ? "0" + seconds : seconds;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      hours = hours < 10 ? "0" + hours : hours;

      // set the hours, mins and secs in component state
      this.setState({
        timer: {
          hours: hours,
          minutes: minutes,
          seconds: seconds
        }
      });
    }, 200);
  }

  dispatchMessages = () => {
    // check which message should be dispatched
    const result = getgeoNotificationStatus(
      this.props.expiryTime,
      this.props.currentLocation,
      this.props.storedLocaiton
    );

    // dispatch the messages based on the result
    switch (result) {
      case 1:
        if (!this.state.sentMessages.headback) {
          this.setState({ sentMessages: { headback: true } });
          this.props.addMessage(
            Date.now(),
            "You better head back now if you want to make it back in time"
          );
        }
        break;
      case 2:
        if (!this.state.sentMessages.ifYouRun) {
          this.setState({ sentMessages: { ifYouRun: true } });
          this.props.addMessage(
            Date.now(),
            "You can make it back in time, BUT ONLY IF YOU RUN!!!"
          );
        }
        break;
      case 3:
        if (!this.state.sentMessages.tooLate) {
          this.setState({ sentMessages: { tooLate: true } });
          this.props.addMessage(
            Date.now(),
            "Sorry, you wont make it back in time before your parking expires :("
          );
        }
        // Sorry, you wont make it back in time before your parking expires :(
        break;
      default:
        break;
    }
  };

  // when the session starts
  componentDidMount() {
    // start the timer
    this.calcTimer(this.props.expiryTime);

    // queue messages to the message array
    this.props.addMessage(
      this.props.expiryTime,
      "Your parking time has run out!"
    );

    this.props.addMessage(
      notifyUser(this.props.expiryTime),
      "Your parking time is running out!"
    );
  }

  // when session is cancelled
  componentWillUnmount() {
    // stop the timer
    clearInterval(this.intervalID);

    // clear messages
    this.props.removeMessages();
  }

  render() {
    const { hours, minutes, seconds } = this.state.timer;
    return (
      <div className="controls">
        <div className="timer">{`${hours}:${minutes}:${seconds}`}</div>
        <Button
          handleClick={this.props.onClearSession}
          text="DISMISS"
          color="red"
        />
      </div>
    );
  }
}

export default Session;
