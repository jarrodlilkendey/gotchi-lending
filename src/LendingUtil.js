const axios = require('axios');
const _ = require('lodash');
const { ethers } = require('ethers');
const moment = require('moment');

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
            owner: "${owner}",
          }
        ) {
          id
          name
          kinship
        }
      }`
    }
  );

  //             originalOwner: "${owner}"

  const ownedLentGotchis = await retrieveOwnedLentAavegotchis(owner);
  const ownerBorrowedGotchis = await retrieveOwnerBorrowedAavegotchis(owner);
  console.log('retrieveOwnedLentAavegotchis', ownedLentGotchis);
  console.log('retrieveOwnerBorrowedAavegotchis', ownerBorrowedGotchis);

  let aavegotchis = [];
  gotchis.data.data.aavegotchis.map((g) => {
    if (!_.find([...ownedLentGotchis, ...ownerBorrowedGotchis], ['gotchi.id', g.id])) {
      aavegotchis.push(g);
    }
  });

  let gotchiIds = [];
  for (let i = 0; i < aavegotchis.length; i++) {
    gotchiIds.push(aavegotchis[i].id);
  }

  const gotchiChanneling = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic',
    {
      query: `{
        gotchis(
          first: 1000,
          where: { id_in: [${gotchiIds.join()}] }
        ) {
          id
          lastChanneledAlchemica
        }
      }`
    }
  );

  for (let i = 0; i < aavegotchis.length; i++) {
    let gotchi = aavegotchis[i];

    aavegotchis[i].kinship = parseInt(gotchi.kinship);

    let channelingData = null;
    if (_.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id]).length > 0) {
      channelingData = _.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id])[0];
      aavegotchis[i].lastChanneledUnix = parseInt(channelingData.lastChanneledAlchemica);
    } else {
      aavegotchis[i].lastChanneledUnix = 0;
    }

    aavegotchis[i].channelable = false;

    let lastChanneledDay = Math.floor(gotchi.lastChanneledUnix / (60 * 60 * 24));
    let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
    if (lastChanneledDay != currentDay) {
      aavegotchis[i].channelable = true;
    }
  }

  aavegotchis = _.orderBy(aavegotchis, ['kinship'], ['desc']);

  console.log('aavegotchis', aavegotchis);

  return aavegotchis;
};

export const retrieveOwnerBorrowedAavegotchis = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(where:{ borrower: "${owner}", completed:false, cancelled:false }) {
        gotchi {
          id
          name
        }
      }}`
    }
  );

  return rentals.data.data.gotchiLendings;
};

export const retrieveOwnedLentAavegotchis = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(where:{ lender: "${owner}", completed:false, cancelled:false }) {
        gotchi {
          id
          name
        }
      }}`
    }
  );

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

  let aavegotchis = [];
  let gotchiIds = [];
  rentals.data.data.gotchiLendings.map((g) => {
    aavegotchis.push(g);
    gotchiIds.push(g.gotchi.id);
  });

  const gotchiChanneling = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic',
    {
      query: `{
        gotchis(
          first: 1000,
          where: { id_in: [${gotchiIds.join()}] }
        ) {
          id
          lastChanneledAlchemica
        }
      }`
    }
  );

  for (let i = 0; i < aavegotchis.length; i++) {
    let gotchi = aavegotchis[i].gotchi;

    let channelingData = null;
    if (_.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id]).length > 0) {
      channelingData = _.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id])[0];
      aavegotchis[i].lastChanneledUnix = parseInt(channelingData.lastChanneledAlchemica);
    } else {
      aavegotchis[i].lastChanneledUnix = 0;
    }

    aavegotchis[i].channelable = false;

    let lastChanneledDay = Math.floor(aavegotchis[i].lastChanneledUnix / (60 * 60 * 24));
    let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
    if (lastChanneledDay != currentDay) {
      aavegotchis[i].channelable = true;
    }
  }

  return aavegotchis;
};

export const retrieveClaimable = async(owner) => {
  const rentals = await axios.post(
    'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending',
    // 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two',
    {
      query: `{
        gotchiLendings(first: 1000, where:{ lender: "${owner}", completed:false, cancelled:false, timeAgreed_not: 0 }) {
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

  let aavegotchis = [];
  let gotchiIds = [];
  rentals.data.data.gotchiLendings.map((g) => {
    aavegotchis.push(g);
    gotchiIds.push(g.gotchi.id);
  });

  const gotchiChanneling = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic',
    {
      query: `{
        gotchis(
          first: 1000,
          where: { id_in: [${gotchiIds.join()}] }
        ) {
          id
          lastChanneledAlchemica
        }
      }`
    }
  );

  for (let i = 0; i < aavegotchis.length; i++) {
    let gotchi = aavegotchis[i].gotchi;

    let channelingData = null;
    if (_.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id]).length > 0) {
      channelingData = _.filter(gotchiChanneling.data.data.gotchis, ['id', gotchi.id])[0];
      aavegotchis[i].lastChanneledUnix = parseInt(channelingData.lastChanneledAlchemica);
      let duration = moment.duration(moment().diff(moment.unix(aavegotchis[i].lastChanneledUnix)));
      aavegotchis[i].lastAltarChannelRelative = `${parseInt(duration.asHours())} hours and ${parseInt(duration.asMinutes()) % 60} mins ago`;
    } else {
      aavegotchis[i].lastChanneledUnix = 0;
      aavegotchis[i].lastAltarChannelRelative = "";
    }

    aavegotchis[i].channelable = false;

    let lastChanneledDay = Math.floor(aavegotchis[i].lastChanneledUnix / (60 * 60 * 24));
    let currentDay = Math.floor(moment().unix() / (60 * 60 * 24));
    if (lastChanneledDay != currentDay) {
      aavegotchis[i].channelable = true;
    }
  }

  return aavegotchis;
};

export const listingPerformance = async(listingId) => {
  const performance = await axios.post(
    'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending',
    {
      query: `{
        gotchiLendings(first: 1000, where: {id: ${listingId}}) {
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
        gotchiLendings(first: 1000, where: {borrower: "${borrower.toLowerCase()}"}) {
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

const myCompletedRentalsQuery = (owner, i) => {
  let query = `{
    gotchiLendings(first:1000, skip: ${i}, where: {originalOwner: "${owner.toLowerCase()}", cancelled: false, completed: true}) {
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
      upfrontCost
    }
  }`;

  return query;
};

export const myCompletedRentals = async(owner) => {
  let rentals = [];

  for (var i = 0; i < 5000; i+=1000) {
    const performance = await axios.post(
      'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending',
      {
        query: myCompletedRentalsQuery(owner, i)
      }
    );

    performance.data.data.gotchiLendings.map((r) => {
      rentals.push(r);
    });

    if (performance.data.data.gotchiLendings.length != 1000) {
      i = 5000;
    }
  }

  return rentals;
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
