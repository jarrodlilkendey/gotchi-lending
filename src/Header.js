import React from "react";

import { NavLink } from "react-router-dom";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

function isActive(location, path) {
  if (path == location) {
    return "nav-link active";
  } else {
    return "nav-link";
  }
}

export default function Header() {
  let location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg my-nav">
      <div className="container-fluid">
        <NavLink to="/">
          <img alt="GotchiLending.com" src="/logo.png" height="42px" />
        </NavLink>
         <div className="collapse navbar-collapse" id="navbarNav">
           <ul className="nav nav-tabs">
             {/*<li className="nav-item">
              <NavLink to="/bulklend" className={isActive(location, '/bulklend')}>BULK LISTOOOR</NavLink>
             </li>*/}

             <li className="nav-item">
              <NavLink to="/activity" className={isActive(location, '/activity')}>RECENT LENDING ACTIVITY</NavLink>
             </li>

             <li className="nav-item">
              <NavLink to="/borrower" className={isActive(location, '/borrower')}>BORROWER ANALYTICS</NavLink>
             </li>

             <li className="nav-item">
              <NavLink to="/bulkcancel" className={isActive(location, '/bulkcancel')}>BULK CANCELOOOR</NavLink>
             </li>

             <li className="nav-item">
              <NavLink to="/bulkend" className={isActive(location, '/bulkend')}>BULK CLAIM ENDOOOR</NavLink>
             </li>

             {/*}
             <p><Link to={"/bulklend"}>Bulk Lending</Link></p>
             <p><Link to={"/bulkcancel"}>Bulk Cancel Lending</Link></p>
             <p><Link to={"/bulkend"}>Bulk Claim End</Link></p>
             <p><Link to={"/lookuprenter"}>Lookup Renter</Link></p>
             <p><Link to={"/activity"}>Recent Lending Activity</Link></p>
             <p><Link to={"/activity"}>Lender Daily Revenue</Link></p>
             <p><a href={"https://tools.wagmiwarriors.com/leaderboard"}>Guild Leaderboard</a></p>
             */}
           </ul>
         </div>
         <div className="navbar-brand navbar-right">
          <p>A WAGMI Warriors Property <a href="https://discord.gg/TNneBnhrM2"><img alt="WAGMI Warriors Guild" src="/smug-wagie.png" width="48px" /></a></p>
         </div>
       </div>
    </nav>
  );
}
