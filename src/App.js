import logo from './logo.svg';
import './App.css';

import { Routes, Route, Link } from "react-router-dom";

import BulkLister from './BulkLister';
import BulkCancel from './BulkCancel';
import BulkClaimEnd from './BulkClaimEnd';
import RenterPerformance from './RenterPerformance';
import GuildLeaderboard from './GuildLeaderboard';

function App() {
  return (
    <div>
      <div>
        <ul>
          <li><Link to={"/bulklend"}>Bulk Lending</Link></li>
          <li><Link to={"/bulkcancel"}>Bulk Cancel Lending</Link></li>
          <li><Link to={"/bulkend"}>Bulk Claim End</Link></li>
          <li><Link to={"/leaderboard"}>Guild Leaderboard</Link></li>
        </ul>
      </div>
      <div>
        <Routes>
          <Route path="/bulklend" element={<BulkLister />} />
          <Route path="/bulkcancel" element={<BulkCancel />} />
          <Route path="/bulkend" element={<BulkClaimEnd />} />
          <Route path="/performance" element={<RenterPerformance />} />
          <Route path="/leaderboard" element={<GuildLeaderboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
