import React from "react";
import "../assets/css/App.css";
import {
  Switch,
  Route,
  BrowserRouter as Router,
  Redirect,
} from "react-router-dom";
import Login from "../pages/login";
import SignUp from "../pages/signup";
import UserProfile from "../pages/userprofile";
import Home from "../pages/home";
import { UserContext } from "./user-context";

type AppState = {
  user: Object;
  updateUser: (newUser: Object) => void;
};

class App extends React.Component {
  state: AppState = {
    user: window.localStorage.getItem("user") ?? { name: "?" },
    updateUser: (newUser: Object) => {
      this.setState({ user: newUser });
      // Caches current authenticated user to local storage for offline viewing
      window.localStorage.setItem("user", JSON.stringify(newUser));
    },
  };

  render() {
    return (
      <Router>
        <UserContext.Provider value={this.state}>
          <Switch>
            <Route path="/user" component={UserProfile} />
            <Route path="/signup" component={SignUp} />
            <Route path="/login" component={Login} />
            <Route path="/home" component={Home} />
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </Switch>
        </UserContext.Provider>
      </Router>
    );
  }
}

export default App;
