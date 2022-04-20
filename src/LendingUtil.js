const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');

// export const getUnlentGotchis = async(owner) => {
//   const ownedGotchis = await getOwnedGotchis(owner);
//   const lentGotchis = await retrieveOwnedRentalAavegotchis(owner);
//
//   console.log(ownedGotchis);
//   console.log(lentGotchis);
// }

export const getUnlentGotchis = async(owner) => {
  const gotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        aavegotchis(
          first: 1000,
          skip: 0,
          where: {
            status: 3,
            owner: "${owner}"
          }
        ) {
          id
          name
        }
      }`
    }
  );

  const rentalGotchis = await retrieveOwnedRentalAavegotchis(owner);

  let aavegotchis = [];
  gotchis.data.data.aavegotchis.map((g) => {
    if (!_.find(rentalGotchis, ['gotchi.id', g.id])) {
      aavegotchis.push(g);
    }
  });


  return aavegotchis;
};

export const retrieveOwnedRentalAavegotchis = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(where:{ lender: "${owner}", completed:false, cancelled:false }) {
        gotchi {
          id
        }
      }}`
    }
  );

  console.log('rentalGotchis', rentals);

  return rentals.data.data.gotchiLendings;
};

export const retrieveOwnedUncancelledRentalAavegotchis = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(where:{ lender: "${owner}", completed:false, cancelled:false, timeAgreed: 0 }) {
        gotchi {
          id
        }
        completed
        upfrontCost
        timeCreated
        timeAgreed
        id
        lastClaimed
        rentDuration
        whitelistId
      }}`
    }
  );

  console.log('rentalGotchis', rentals);

  return rentals.data.data.gotchiLendings;
};

export const retrieveClaimable = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(where:{ lender: "${owner}", completed:false, cancelled:false, timeAgreed_not: 0 }) {
        gotchi {
          id
          name
        }
        completed
        upfrontCost
        timeCreated
        timeAgreed
        id
        lastClaimed
        rentDuration
        whitelistId
        borrower
        period
      }}`
    }
  );

  console.log('rentalGotchis', rentals);

  return rentals.data.data.gotchiLendings;
};

export const listingPerformance = async(listingId) => {
  const performance = await axios.post(
    'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending',
    {
      query: `{
        gotchiLendings(where: {id: ${listingId}}) {
          id
          gotchiId
          lender {
            id
          }
          borrower {
            id
          }
          thirdPartyAddress {
            id
          }
          claimedFUD
          claimedFOMO
          claimedALPHA
          claimedKEK
          startTimestamp
          endTimestamp
        }
      }`
    }
  );

  return performance.data.data.gotchiLendings;
};

export const renterPerformance = async(borrower) => {
  const performance = await axios.post(
    'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending',
    {
      query: `{
        gotchiLendings(where: {borrower: "${borrower.toLowerCase()}"}) {
          id
          gotchiId
          lender {
            id
          }
          borrower {
            id
          }
          thirdPartyAddress {
            id
          }
          claimedFUD
          claimedFOMO
          claimedALPHA
          claimedKEK
          startTimestamp
          endTimestamp
        }
      }`
    }
  );

  return performance.data.data.gotchiLendings;
};

export const leaderboard = async(thirdPartyAddress) => {
  const performance = await axios.post(
    'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending',
    {
      query: `{
        gotchiLendings(first: 1000, start: 0, where: {thirdPartyAddress: "${thirdPartyAddress.toLowerCase()}", started: true}, orderBy: startTimestamp, orderDirection: desc) {
          id
          gotchiId
          lender {
            id
          }
          borrower {
            id
          }
          thirdPartyAddress {
            id
          }
          claimedFUD
          claimedFOMO
          claimedALPHA
          claimedKEK
          startTimestamp
          endTimestamp
          splitOwner
          splitBorrower
          splitOther
          started
        }
      }`
    }
  );

  return performance.data.data.gotchiLendings;
};

export const getFreeLendingActivityQuery = (skip) => {
  return `{
    gotchiLendings(first: 1000, skip: ${skip}, where:{ timeAgreed_not: 0, upfrontCost: 0 }, orderBy:timeAgreed, orderDirection:desc) {
    gotchi {
      id
      name
    }
    completed
    upfrontCost
    timeCreated
    timeAgreed
    id
    lastClaimed
    rentDuration
    whitelistId
    borrower
    period
  }}`;
}

export const getUpfrontLendingActivityQuery = (skip) => {
  return `{
    gotchiLendings(first: 1000, skip: ${skip}, where:{ timeAgreed_not: 0, upfrontCost_not: 0 }, orderBy:timeAgreed, orderDirection:desc) {
    gotchi {
      id
      name
    }
    completed
    upfrontCost
    timeCreated
    timeAgreed
    id
    lastClaimed
    rentDuration
    whitelistId
    borrower
    period
    splitBorrower
    splitOwner
    splitOther
  }}`;
}

export const getFreeLendingActivity = async() => {
  let lendingActivity = [];

  for (var i = 0; i < 5000; i+=1000) {
    const rentals = await axios.post(
      'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
      {
        query: getFreeLendingActivityQuery(i)
      }
    );

    rentals.data.data.gotchiLendings.map((r) => {
      lendingActivity.push(r);
    });
  }

  return lendingActivity;
};

export const getUpfrontLendingActivity = async() => {
  let lendingActivity = [];

  for (var i = 0; i < 5000; i+=1000) {
    const rentals = await axios.post(
      'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
      {
        query: getUpfrontLendingActivityQuery(i)
      }
    );

    rentals.data.data.gotchiLendings.map((r) => {
      lendingActivity.push(r);
    });
  }

  return lendingActivity;
};
