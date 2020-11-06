import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import ListIP from './Listip'

function App() {
  return (
    <Router>
      <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          MELI CHALLENGE!!!
        </p>
        <div>
          <Route exact path="/" component={ListIP} />
        </div>
      </header>
    </div>
  </Router>
  );
}

export default App;
