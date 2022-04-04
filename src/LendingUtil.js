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
    'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
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
    'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
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
    'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
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
