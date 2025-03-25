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
import TreeDiff from './TreeDiff'
import MAM from './MAM'
import ETHSig from './ETHSig'
import AvionDB from './AvionDB'
import Ed25519 from './Ed25519'
import Commits from './Commits'
import { IPFSProvider } from './IPFSContext'

export default () => (
  <IPFSProvider><Router>
    <div className='app'>
      <Route path='/ENSReverse' component={ENSReverse}/>
      <Route path='/Mailvelope' component={Mailvelope}/>
      <Route path='/SSLHostCheck' component={SSLHostCheck}/>
      <Route path='/Diff' component={TreeDiff}/>
      <Route path='/MAM' component={MAM}/>
      <Route path='/ETHSig' component={ETHSig}/>
      <Route path='/Ed25519' component={Ed25519}/>
      <Route path='/AvionDB/*' component={AvionDB}/>
      <Route path='/r/*' component={Repo}/>
      <Route path='/commits/*' component={Commits}/>
      <Route path='/' exact={true} component={Home} />
    </div>
  </Router></IPFSProvider>
)