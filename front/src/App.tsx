import React from 'react';
import logo from './logo.svg';
import Box from '@material-ui/core/Box';
import './App.css';
import Header from "./commons/headers/Header";

import GameCreate from "./game/create/gameCreate";
import GameDisplay from "./game/display/gameDisplay";
import GameList from "./game/list/gameList";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';


const App = () => {
  return (
      <Router >
        <Header />
          <Switch>
              <Route exact path="/gamecreate">
                  <GameCreate />
              </Route>
              <Route path="/gamedisplay">
                  <GameDisplay />
              </Route>
              <Route path="/gamelist">
                  <GameList />
              </Route>
          </Switch>
      </Router>
  );
}

export default App;