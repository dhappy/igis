import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import 'antd/dist/antd.css'
import ENSReverse from './ENSReverse'
//import CheckSig from './CheckSig'
import Mailvelope from './Mailvelope'
import Repo from './Repository'
import Home from './Home'
import SSLHostCheck from './SSLHostCheck'
import Diff from './Diff'
import { IPFSProvider } from './IPFSContext'

export default () => (
  <IPFSProvider><Router>
    <div className='app'>
      <Route path='/ENSReverse' component={ENSReverse}/>
      <Route path='/Mailvelope' component={Mailvelope}/>
      <Route path='/SSLHostCheck' component={SSLHostCheck}/>
      <Route path='/Diff' component={Diff}/>
      <Route path='/r/*' component={Repo}/>
      <Route path='/' exact={true} component={Home} />
    </div>
  </Router></IPFSProvider>
)