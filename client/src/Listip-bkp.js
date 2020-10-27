//import React, { Component } from 'react';
import { Component } from 'react';
//import axios from 'axios';

class ListIP extends Component {
    state = {
      seenIp: [],
    };

    async componentDidMount() {
        this.fetchListIP()
      }
    
    fetchListIP = async () => {
        //const seenIp = await axios.get('https://www.dan.me.uk/torlist/', {
        //  mode: 'no-cors'
        //});
        const iplist = await fetch ('https://www.dan.me.uk/torlist/', {
          mode: 'no-cors'
        });
        this.setState({
          seenIp: iplist.data,
        });

    }

    renderSeenIp() {
      return this.state.seenIp
    }

    render() {
      return (
        <div>
          <h3>IP I have seen:</h3>
          {this.renderSeenIp()}
        </div>
      );
    }
}

export default ListIP;