import logo from './logo.svg';
import './App.css';

import { Routes, Route, Link } from "react-router-dom";

import BulkLister from './BulkLister';
import BulkCancel from './BulkCancel';
import BulkClaimEnd from './BulkClaimEnd';
import RenterPerformance from './RenterPerformance';

function App() {
  return (
    <div>
      <div>
        <ul>
          <li><Link to={"/bulklend"}>Bulk Lending</Link></li>
          <li><Link to={"/bulkcancel"}>Bulk Cancel Lending</Link></li>
          <li><Link to={"/bulkend"}>Bulk Claim End</Link></li>
        </ul>
      </div>
      <div>
        <Routes>
          <Route path="/bulklend" element={<BulkLister />} />
          <Route path="/bulkcancel" element={<BulkCancel />} />
          <Route path="/bulkend" element={<BulkClaimEnd />} />
          <Route path="/performance" element={<RenterPerformance />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
