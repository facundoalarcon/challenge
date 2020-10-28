import React, { Component } from 'react';
import axios from 'axios';

class ListIP extends Component {
  state = {
    seenIp: [],
    values: [],
    missing: [],
    ip: '',
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIp();
    this.fetchMissing();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/all');
    //const values = await axios.get('/api/values/all');
    this.setState({ 
      values: values.data
    });
  }

  async fetchIp() {
    // const seenIp = await axios.get('/api/values/all');
    //const seenIp = await axios.get('/api/values/tor');
    const seenIp = await axios.get('/api/values/test');
    this.setState({
      seenIp: seenIp.data,
    });
  }

  async fetchMissing() {
    const missing = await axios.get('/api/values/missing');
    this.setState({
      missing: missing.data,
    });
  }


  handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('/api/values', {
      ip: this.state.ip,
    })
      .then (() => console.log('IP added'))
      .catch(err => {
        console.error(err);
      });
    this.setState({ ip: '' });
  };

  renderSeenIp() {
    return this.state.seenIp;
  }

  renderValues() {
    return this.state.values.map(({ ip }) => ip).join(' ');
  }

  renderMissing() {
    return this.state.missing;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your ip:</label>
          <input
            value={this.state.ip}
            onChange={(event) => this.setState({ ip: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h4>Ip I have seen from source:</h4>
        {this.renderSeenIp()}

        <h4>IP saved:</h4>
        {this.renderValues()}

        <h4>IP to Add:</h4>
        {this.renderMissing()}
      </div>
    );
  }
}

export default ListIP;