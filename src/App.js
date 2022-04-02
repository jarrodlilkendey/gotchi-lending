import logo from './logo.svg';
import './App.css';

import { Routes, Route, Link } from "react-router-dom";

import BulkLister from './BulkLister';
import BulkCancel from './BulkCancel';
import BulkClaimEnd from './BulkClaimEnd';

function App() {
  return (
    <div>
      <div>
        <p>Gotchi Lending Use Cases</p>
        <ul>
          <li><Link to={"/bulklend"}>Bulk Lending</Link></li>
          <li><Link to={"/bulkcancel"}>Bulk Cancel Lending</Link></li>
          <li><Link to={"/bulkend"}>Bulk Claim End</Link></li>
          <li>Find Completed GHST Upfront Rentals</li>
          <li>Find Long Running Non Rented Gotchis</li>
        </ul>
      </div>
      <div>
        <Routes>
          <Route path="/bulklend" element={<BulkLister />} />
          <Route path="/bulkcancel" element={<BulkCancel />} />
          <Route path="/bulkend" element={<BulkClaimEnd />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
